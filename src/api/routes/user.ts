import createError from 'http-errors';

import { Router, Response, NextFunction } from 'express';
import { getRepository, ILike, Equal } from 'typeorm';
import { MessageEmbed } from 'discord.js';

import { environment } from '../../environments/api/environment';

import { UserRequest } from '../models/UserRequest';
import { Role } from '../../app/_shared/models/Role';

import { User } from '../entities/User';
import { Berkas } from '../entities/Berkas';
import { Profile } from '../entities/Profile';
import { KartuTandaPenduduk } from '../entities/KartuTandaPenduduk';

import { isAuthorized, isLogin } from '../middlewares/auth';

import { JwtEncode, JwtView, hashPassword } from '../helpers/crypto';

const router = Router();

// GET `/api/user`
router.get('/', isLogin, async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    let maxPage = 0;
    let maxRow = 10;
    if (req.user) {
      if (req.user.role == Role.ADMIN || req.user.role == Role.MODERATOR) {
        maxPage = req.query.page || 0;
        maxRow = req.query.row || 10;
      }
    }
    const userRepo = getRepository(User);
    const [user, count] = await userRepo.findAndCount({
      where: [
        { username: ILike(`%${req.query.q ? req.query.q : ''}%`) },
        { email: ILike(`%${req.query.q ? req.query.q : ''}%`) },
        {
          kartu_tanda_penduduk_: {
            nama: ILike(`%${req.query.q ? req.query.q : ''}%`)
          }
        }
      ],
      order: {
        ...((req.query.sort && req.query.order) ? {
          [req.query.sort]: req.query.order.toUpperCase()
        } : {
          id: 'DESC'
        })
      },
      relations: ['kartu_tanda_penduduk_', 'profile_'],
      skip: maxPage > 0 ? (maxPage * maxRow - maxRow) : 0,
      take: (maxRow > 0 && maxRow <= 500) ? maxRow : 10
    });
    for (const u of user) {
      delete u.password;
      delete u.session_token;
      if ('kartu_tanda_penduduk_' in u && u.kartu_tanda_penduduk_) {
        delete u.kartu_tanda_penduduk_.id;
        delete u.kartu_tanda_penduduk_.agama;
        delete u.kartu_tanda_penduduk_.alamat;
        delete u.kartu_tanda_penduduk_.golongan_darah;
        delete u.kartu_tanda_penduduk_.kecamatan;
        delete u.kartu_tanda_penduduk_.kelurahan_desa;
        delete u.kartu_tanda_penduduk_.kewarganegaraan;
        delete u.kartu_tanda_penduduk_.nik;
        delete u.kartu_tanda_penduduk_.pekerjaan;
        delete u.kartu_tanda_penduduk_.rt;
        delete u.kartu_tanda_penduduk_.rw;
        delete u.kartu_tanda_penduduk_.status_perkawinan;
        delete u.kartu_tanda_penduduk_.created_at;
        delete u.kartu_tanda_penduduk_.updated_at;
      }
      if ('profile_' in u && u.profile_) {
        delete u.profile_.id;
        delete u.profile_.created_at;
        delete u.profile_.updated_at;
      }
    }
    return res.status(200).json({
      info: `😅 200 - User API :: List All 🤣`,
      count,
      pages: Math.ceil(count / (req.query.row ? req.query.row : 10)),
      results: user
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      info: `🙄 400 - User API :: Gagal Mendapatkan All User 😪`,
      result: {
        message: 'Data Tidak Lengkap!'
      }
    });
  }
});

// GET `/api/user/:username`
router.get('/:username', async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const userRepo = getRepository(User);
    const selectedUser = await userRepo.findOneOrFail({
      where: [
        { username: ILike(req.params.username) }
      ],
      relations: ['kartu_tanda_penduduk_', 'profile_']
    });
    delete selectedUser.password;
    delete selectedUser.session_token;
    if ('kartu_tanda_penduduk_' in selectedUser && selectedUser.kartu_tanda_penduduk_) {
      delete selectedUser.kartu_tanda_penduduk_.id;
      delete selectedUser.kartu_tanda_penduduk_.agama;
      delete selectedUser.kartu_tanda_penduduk_.alamat;
      delete selectedUser.kartu_tanda_penduduk_.golongan_darah;
      delete selectedUser.kartu_tanda_penduduk_.kecamatan;
      delete selectedUser.kartu_tanda_penduduk_.kelurahan_desa;
      delete selectedUser.kartu_tanda_penduduk_.kewarganegaraan;
      delete selectedUser.kartu_tanda_penduduk_.nik;
      delete selectedUser.kartu_tanda_penduduk_.pekerjaan;
      delete selectedUser.kartu_tanda_penduduk_.rt;
      delete selectedUser.kartu_tanda_penduduk_.rw;
      delete selectedUser.kartu_tanda_penduduk_.status_perkawinan;
      delete selectedUser.kartu_tanda_penduduk_.created_at;
      delete selectedUser.kartu_tanda_penduduk_.updated_at;
    }
    if ('profile_' in selectedUser && selectedUser.profile_) {
      delete selectedUser.profile_.id;
      delete selectedUser.profile_.created_at;
      delete selectedUser.profile_.updated_at;
    }
    return res.status(200).json({
      info: `😅 200 - User API :: Detail ${req.params.username} 🤣`,
      result: selectedUser
    });
  } catch (error) {
    console.error(error);
    return next(createError(404));
  }
});

// PUT `/api/user/:username`
router.put('/:username', isAuthorized, async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    if ('description' in req.body || 'new_password' in req.body || 'image_photo' in req.body || 'image_cover' in req.body) {
      try {
        const userRepo = getRepository(User);
        const selectedUser = await userRepo.findOneOrFail({
          where: [
            { username: ILike(req.params.username) }
          ],
          relations: ['kartu_tanda_penduduk_', 'profile_']
        });
        if (req.user.id === selectedUser.id) {
          if (req.body.image_photo) {
            selectedUser.image_url = req.body.image_photo;
          }
          if (req.body.new_password) {
            selectedUser.password = hashPassword(req.body.new_password);
          }
          try {
            const profileRepo = getRepository(Profile);
            const selectedProfile = await profileRepo.findOneOrFail({
              where: [
                { id: selectedUser.profile_.id }
              ]
            });
            if (req.body.image_cover) {
              selectedProfile.cover_url = req.body.image_cover;
            }
            if (req.body.description) {
              selectedProfile.description = req.body.description;
            }
            const resProfileSave = await profileRepo.save(selectedProfile);
            selectedUser.profile_ = resProfileSave;
            let resUserSave = await userRepo.save(selectedUser);
            req.botSendNews({
              embeds: [
                new MessageEmbed()
                  .setColor('#ff4081')
                  .setTitle(resUserSave.kartu_tanda_penduduk_.nama)
                  .setURL(`${environment.baseUrl}/user/${resUserSave.username}`)
                  .setAuthor('Hikki - Pembaharuan Data Pengguna', `${environment.baseUrl}/assets/img/favicon.png`, environment.baseUrl)
                  .setDescription(resUserSave.profile_.description.replace(/<[^>]*>/g, ' ').trim())
                  .setThumbnail(resUserSave.image_url === '/favicon.ico' ? `${environment.baseUrl}/assets/img/favicon.png` : resUserSave.image_url)
                  .setTimestamp(resUserSave.updated_at)
                  .setFooter(
                    resUserSave.username,
                    resUserSave.image_url === '/favicon.ico' ? `${environment.baseUrl}/assets/img/favicon.png` : resUserSave.image_url
                  )
              ]
            });
            delete resUserSave.password;
            delete resUserSave.session_token;
            delete resUserSave.kartu_tanda_penduduk_;
            delete resUserSave.profile_;
            selectedUser.session_token = JwtEncode(resUserSave, false);
            resUserSave = await userRepo.save(selectedUser);
            res.cookie(environment.tokenName, resUserSave.session_token, {
              httpOnly: true,
              secure: environment.production,
              sameSite: 'strict',
              expires: new Date(JwtView(resUserSave.session_token).exp * 1000),
              domain: environment.domain
            });
            return res.status(200).json({
              info: `😅 200 - User API :: Ubah ${req.params.username} 🤣`,
              result: {
                jwtToken: resUserSave.session_token
              }
            });
          } catch (e) {
            console.error(e);
            return next(createError(404));
          }
        } else {
          return res.status(401).json({
            info: '🙄 401 - User API :: Authorisasi Kepemilikan Gagal 😪',
            result: {
              message: 'Profil Milik Orang Lain!'
            }
          });
        }
      } catch (err) {
        console.error(err);
        return next(createError(404));
      }
    } else {
      throw new Error('Data Tidak Lengkap');
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      info: `🙄 400 - User API :: Gagal Mengubah Profile ${req.params.id} 😪`,
      result: {
        message: 'Data Tidak Lengkap!'
      }
    });
  }
});

// PATCH `/api/user/:username/berkas`
router.patch('/:username/berkas', async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const userRepo = getRepository(User);
    const selectedUser = await userRepo.findOneOrFail({
      where: [
        { username: ILike(req.params.username) }
      ]
    });
    const fileRepo = getRepository(Berkas);
    const [files, count] = await fileRepo.findAndCount({
      where: [
        {
          name: ILike(`%${req.query.q ? req.query.q : ''}%`),
          user_: {
            id: Equal(selectedUser.id)
          }
        }
      ],
      order: {
        ...((req.query.sort && req.query.order) ? {
          [req.query.sort]: req.query.order.toUpperCase()
        } : {
          created_at: 'DESC',
          name: 'ASC'
        })
      },
      relations: ['project_type_', 'fansub_', 'user_', 'anime_'],
      skip: req.query.page > 0 ? (req.query.page * req.query.row - req.query.row) : 0,
      take: (req.query.row > 0 && req.query.row <= 500) ? req.query.row : 10
    });
    for (const f of files) {
      delete f.private;
      delete f.download_url;
      delete f.description;
      if ('project_type_' in f && f.project_type_) {
        delete f.project_type_.created_at;
        delete f.project_type_.updated_at;
      }
      if ('fansub_' in f && f.fansub_) {
        for (const fansub of f.fansub_) {
          delete fansub.description;
          delete fansub.urls;
          delete fansub.tags;
          delete fansub.created_at;
          delete fansub.updated_at;
        }
      }
      if ('anime_' in f && f.anime_) {
        delete f.anime_.created_at;
        delete f.anime_.updated_at;
      }
      if ('user_' in f && f.user_) {
        delete f.user_.role;
        delete f.user_.password;
        delete f.user_.session_token;
        delete f.user_.created_at;
        delete f.user_.updated_at;
      }
    }
    return res.status(200).json({
      info: `😅 200 - User API :: Berkas ${req.params.username} 🤣`,
      count,
      pages: Math.ceil(count / (req.query.row ? req.query.row : 10)),
      results: files
    });
  } catch (error) {
    console.error(error);
    return next(createError(404));
  }
});

// DELETE `/api/user/:username`
router.delete('/:username', isAuthorized, async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user.role === Role.ADMIN || req.user.role === Role.MODERATOR) {
      const ktpRepo = getRepository(KartuTandaPenduduk);
      const profileRepo = getRepository(Profile);
      const userRepo = getRepository(User);
      const user =  await userRepo.findOneOrFail({
        where: [
          { username: ILike(req.params.username) }
        ],
        relations: ['profile_']
      });
      const ktp = await ktpRepo.findOneOrFail({
        where: [
          { id: Equal(user.id) }
        ]
      });
      const profile = await profileRepo.findOneOrFail({
        where: [
          { id: Equal(user.profile_.id) }
        ]
      });
      const deletedUser = await userRepo.remove(user);
      const deletedKtp = await ktpRepo.remove(ktp);
      const deletedProfile = await profileRepo.remove(profile);
      delete deletedUser.role;
      delete deletedUser.password;
      delete deletedUser.session_token;
      return res.status(200).json({
        info: `😅 200 - User API :: Berhasil Menghapus User ${req.params.username} 🤣`,
        result: {
          user: deletedUser,
          ktp: deletedKtp,
          profile: deletedProfile
        }
      });
    } else {
      return res.status(401).json({
        info: '🙄 401 - User API :: Authorisasi Pengguna Gagal 😪',
        result: {
          message: 'Khusus Admin / Moderator!'
        }
      });
    }
  } catch (error) {
    console.error(error);
    return next(createError(404));
  }
});

export default router;
