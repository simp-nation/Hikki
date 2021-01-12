import request from 'request';
import translate from '@k3rn31p4nic/google-translate-api';

import { Router, Response, NextFunction } from 'express';
import { getRepository, Like, In } from 'typeorm';

import { UserRequest } from '../models/UserRequest';

import auth from '../middlewares/auth';

import { Berkas } from '../entities/Berkas';
import { Dorama } from '../entities/Dorama';

const router = Router();

const myDramaListV1 = 'https://mydramalist.com/v1';
const kuryanaApi = 'https://kuryana.vercel.app';

const seasonal = [
  { id: 1, name: 'winter' }, { id: 2, name: 'spring' },
  { id: 3, name: 'summer' }, { id: 4, name: 'fall' }
];

// GET `/api/dorama`
router.get('/', async (req: UserRequest, res: Response, next: NextFunction) => {
  const searchQuery = req.query.q || '';
  const searchType = req.query.type || '';
  return request({
    method: 'GET',
    uri: `${kuryanaApi}/search/q/${searchQuery}`
  }, async (error, result, body) => {
    return res.status(result.statusCode).json({
      info: `😅 ${result.statusCode} - Dorama API :: Search ${searchQuery} 🤣`,
      results: (
        'results' in JSON.parse(body)
          ? JSON.parse(body).results.filter(x => x.type.toLowerCase().includes(searchType))
          : []
      )
    });
  });
});

// POST `/api/dorama`
router.post('/', auth.isAuthorized, async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    if ('id' in req.body && 'name' in req.body && 'image_url' in req.body) {
      const doramaRepo = getRepository(Dorama);
      const doramas = await doramaRepo.find({
        where: [
          { id: req.body.id }
        ]
      });
      if (doramas.length === 0) {
        const dorama = new Dorama();
        dorama.id = req.body.id;
        dorama.slug = req.body.slug;
        dorama.name = req.body.name;
        dorama.image_url = req.body.image_url;
        dorama.type = req.body.type;
        const resultSaveDorama = await doramaRepo.save(dorama);
        return res.status(200).json({
          info: `😅 200 - Dorama API :: Tambah Baru 🤣`,
          result: resultSaveDorama
        });
      } else if (doramas.length === 1) {
        const dorama = await doramaRepo.findOneOrFail({
          where: [
            { id: doramas[0].id }
          ]
        });
        if (req.body.id) {
          dorama.id = req.body.id;
        }
        if (req.body.slug) {
          dorama.slug = req.body.slug;
        }
        if (req.body.name) {
          dorama.name = req.body.name;
        }
        if (req.body.image_url) {
          dorama.image_url = req.body.image_url;
        }
        if (req.body.type) {
          dorama.type = req.body.type;
        }
        const resultSaveDorama = await doramaRepo.save(dorama);
        return res.status(202).json({
          info: `😅 202 - Dorama API :: Data Dorama Diperbaharui 🤣`,
          result: resultSaveDorama
        });
      } else {
        return res.status(202).json({
          info: `😍 202 - Dorama API :: Data Dorama Multi Duplikat 🥰`,
          result: doramas
        });
      }
    } else {
      throw new Error('Data Tidak Lengkap!');
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      info: `🙄 400 - Dorama API :: Gagal Menambah Dorama 😪`,
      result: {
        message: 'Data Tidak Lengkap!'
      }
    });
  }
});

// GET `/api/dorama/seasonal`
router.get('/seasonal', async (req: UserRequest, res: Response, next: NextFunction) => {
  const currDate = new Date();
  const year = req.query.year || currDate.getFullYear();
  const season = req.query.season || seasonal.find(sB => sB.id === Math.ceil((currDate.getMonth() + 1) / 3)).name;
  const quarter = seasonal.find(sB => sB.name === season).id || Math.ceil((currDate.getMonth() + 1) / 3);
  return request({
    method: 'POST',
    uri: `${myDramaListV1}/quarter_calendar`,
    formData: {
      quarter,
      year
    }
  }, async (error, result, body) => {
    return res.status(result.statusCode).json({
      info: `😅 ${result.statusCode} - Dorama API :: Seasonal ${season} ${year} 🤣`,
      results: (
        Array.isArray(JSON.parse(body))
          ? JSON.parse(body)
          : []
      )
    });
  });
});

// GET `/api/dorama/berkas?id=`
router.get('/berkas', async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const doramaId = req.query.id.split(',');
    if (Array.isArray(doramaId) && doramaId.length > 0) {
      const fileRepo = getRepository(Berkas);
      const [files, count] = await fileRepo.findAndCount({
        where: [
          {
            name: Like(`%${req.query.q ? req.query.q : ''}%`),
            private: false,
            dorama_: {
              id: In(doramaId)
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
        relations: ['project_type_', 'fansub_', 'user_', 'dorama_'],
        skip: req.query.page > 0 ? (req.query.page * req.query.row - req.query.row) : 0,
        take: (req.query.row > 0 && req.query.row <= 100) ? req.query.row : 10
      });
      const results: any = {};
      for (const i of doramaId) {
        results[i] = [];
      }
      for (const f of files) {
        delete f.private;
        delete f.download_url;
        delete f.description;
        delete f.updated_at;
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
        if ('dorama_' in f && f.dorama_) {
          delete f.dorama_.created_at;
          delete f.dorama_.updated_at;
        }
        if ('user_' in f && f.user_) {
          delete f.user_.role;
          delete f.user_.password;
          delete f.user_.session_token;
          delete f.user_.created_at;
          delete f.user_.updated_at;
        }
        results[f.dorama_.id].push(f);
      }
      return res.status(200).json({
        info: `😅 200 - Dorama API :: Berkas 🤣`,
        count,
        pages: Math.ceil(count / (req.query.row ? req.query.row : 10)),
        results
      });
    } else {
      throw new Error('Data Tidak Lengkap!');
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      info: `🙄 400 - Dorama API :: Gagal Mencari Berkas ${req.query.id} 😪`,
      result: {
        message: 'Data Tidak Lengkap!'
      }
    });
  }
});

// GET `/api/dorama/fansubs?id=`
router.get('/fansub', async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const doramaId = req.query.id.split(',');
    if (Array.isArray(doramaId) && doramaId.length > 0) {
      const fileRepo = getRepository(Berkas);
      const [files, count] = await fileRepo.findAndCount({
        where: [
          {
            dorama_: {
              id: In([doramaId])
            }
          }
        ],
        relations: ['fansub_', 'dorama_']
      });
      const results: any = {};
      for (const i of doramaId) {
        results[i] = [];
      }
      for (const f of files) {
        if ('fansub_' in f && f.fansub_) {
          for (const fansub of f.fansub_) {
            delete fansub.description;
            delete fansub.urls;
            delete fansub.tags;
            delete fansub.created_at;
            delete fansub.updated_at;
            results[f.dorama_.id].push(fansub);
          }
        }
      }
      for (const [key, value] of Object.entries(results)) {
        results[key] = (value as any)
          .filter((a, b, c) => c.findIndex(d => (d.id === a.id)) === b)
          .sort((a, b) => (a.name > b.name) ? 1 : -1);
      }
      return res.status(200).json({
        info: `😅 200 - Dorama API :: Fansub 🤣`,
        count,
        pages: Math.ceil(count / (req.query.row ? req.query.row : 10)),
        results
      });
    } else {
      throw new Error('Data Tidak Lengkap!');
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      info: `🙄 400 - Dorama API :: Gagal Mencari Fansub ${req.query.id} 😪`,
      result: {
        message: 'Data Tidak Lengkap!'
      }
    });
  }
});

// GET `/api/dorama/:mdlSlug`
router.get('/:mdlSlug', async (req: UserRequest, res: Response, next: NextFunction) => {
  return request({
    method: 'GET',
    uri: `${kuryanaApi}/id/${req.params.mdlSlug}`
  }, async (error, result, body) => {
    const dramaDetail = JSON.parse(body);
    let httpStatusCode = result.statusCode;
    if (httpStatusCode === 200) {
      try {
        if (dramaDetail.data.synopsis) {
          const translatedDoramaSynopsis = await translate(dramaDetail.data.synopsis, { to: 'id' });
          dramaDetail.data.synopsis = translatedDoramaSynopsis.text;
        }
      } catch (error) {
        console.error(error);
        httpStatusCode = 202;
        dramaDetail.data.message = 'Penerjemah / Alih Bahasa Gagal!';
      }
    } else {
      httpStatusCode = dramaDetail.status_code;
    }
    return res.status(httpStatusCode).json({
      info: `😅 ${httpStatusCode} - Dorama API :: Detail ${req.params.mdlSlug} 🤣`,
      result: (
        'data' in dramaDetail
          ? dramaDetail.data
          : dramaDetail
      )
    });
  });
});

export default router;
