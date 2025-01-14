import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

import { JenisKelamin } from '../../app/_shared/models/JenisKelamin';
import { GolonganDarah } from '../../app/_shared/models/GolonganDarah';
import { Agama } from '../../app/_shared/models/Agama';
import { WargaNegara } from '../../app/_shared/models/WargaNegara';

@Entity({ name: 'kartu_tanda_penduduk' })
export class KartuTandaPenduduk {

  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint', nullable: true })
  nik: string;

  @Column({ type: 'varchar', length: 255 })
  nama: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tempat_lahir: string;

  @Column({ type: 'date', nullable: true })
  tanggal_lahir: Date;

  @Column({ type: 'enum', enum: [
    JenisKelamin.LAKI,
    JenisKelamin.PEREMPUAN
  ], nullable: true })
  jenis_kelamin: JenisKelamin;

  @Column({ type: 'enum', enum: [
    GolonganDarah.A,
    GolonganDarah.B,
    GolonganDarah.O,
    GolonganDarah.AB
  ], nullable: true })
  golongan_darah: GolonganDarah;

  @Column({ type: 'varchar', length: 255, nullable: true })
  alamat: string;

  @Column({ type: 'smallint', nullable: true })
  rt: number;

  @Column({ type: 'smallint', nullable: true })
  rw: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  kelurahan_desa: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  kecamatan: string;

  @Column({type: 'enum', enum: [
    Agama.BUDDHA,
    Agama.HINDU,
    Agama.ISLAM,
    Agama.KATHOLIK,
    Agama.KONG_HU_CU,
    Agama.KRISTEN_PROTESTAN
  ], nullable: true })
  agama: Agama;

  @Column({ type: 'varchar', length: 255, nullable: true })
  status_perkawinan: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pekerjaan: string;

  @Column({ type: 'enum', enum: [
    WargaNegara.WNI,
    WargaNegara.WNA
  ], nullable: true })
  kewarganegaraan: WargaNegara;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: number;
}
