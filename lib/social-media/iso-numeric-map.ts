// Mappa ISO 3166-1 alpha-2 (lowercase, come usato da GIGA_COUNTRIES) -> numeric (3 cifre,
// con zero padding, come chiavi delle feature in world-atlas/countries-50m.json).
// Kosovo (xk) non ha codice numerico ufficiale: world-atlas usa "-99" come placeholder.

export const ISO_ALPHA2_TO_NUMERIC: Record<string, string> = {
  af: '004', al: '008', dz: '012', as: '016', ad: '020', ao: '024', ai: '660', ag: '028',
  ar: '032', am: '051', aw: '533', au: '036', at: '040', az: '031', bs: '044', bh: '048',
  bd: '050', bb: '052', by: '112', be: '056', bz: '084', bj: '204', bm: '060', bt: '064',
  bo: '068', ba: '070', bw: '072', br: '076', bn: '096', bg: '100', bf: '854', bi: '108',
  cv: '132', kh: '116', cm: '120', ca: '124', ky: '136', cf: '140', td: '148', cl: '152',
  cn: '156', co: '170', km: '174', cg: '178', cd: '180', ck: '184', cr: '188', ci: '384',
  hr: '191', cu: '192', cw: '531', cy: '196', cz: '203', dk: '208', dj: '262', dm: '212',
  do: '214', ec: '218', eg: '818', sv: '222', gq: '226', er: '232', ee: '233', sz: '748',
  et: '231', fj: '242', fi: '246', fr: '250', pf: '258', ga: '266', gm: '270', ge: '268',
  de: '276', gh: '288', gi: '292', gr: '300', gl: '304', gd: '308', gp: '312', gu: '316',
  gt: '320', gg: '831', gn: '324', gw: '624', gy: '328', ht: '332', hn: '340', hk: '344',
  hu: '348', is: '352', in: '356', id: '360', ir: '364', iq: '368', ie: '372', im: '833',
  il: '376', it: '380', jm: '388', jp: '392', je: '832', jo: '400', kz: '398', ke: '404',
  ki: '296', kp: '408', kr: '410', xk: '-99', kw: '414', kg: '417', la: '418', lv: '428',
  lb: '422', ls: '426', lr: '430', ly: '434', li: '438', lt: '440', lu: '442', mo: '446',
  mg: '450', mw: '454', my: '458', mv: '462', ml: '466', mt: '470', mh: '584', mq: '474',
  mr: '478', mu: '480', mx: '484', fm: '583', md: '498', mc: '492', mn: '496', me: '499',
  ms: '500', ma: '504', mz: '508', mm: '104', na: '516', nr: '520', np: '524', nl: '528',
  nc: '540', nz: '554', ni: '558', ne: '562', ng: '566', nu: '570', mk: '807', no: '578',
  om: '512', pk: '586', pw: '585', ps: '275', pa: '591', pg: '598', py: '600', pe: '604',
  ph: '608', pl: '616', pt: '620', pr: '630', qa: '634', ro: '642', ru: '643', rw: '646',
  ws: '882', sm: '674', st: '678', sa: '682', sn: '686', rs: '688', sc: '690', sl: '694',
  sg: '702', sk: '703', si: '705', sb: '090', so: '706', za: '710', ss: '728', es: '724',
  lk: '144', kn: '659', lc: '662', vc: '670', sd: '729', sr: '740', se: '752', ch: '756',
  sy: '760', tw: '158', tj: '762', tz: '834', th: '764', tl: '626', tg: '768', tk: '772',
  to: '776', tt: '780', tn: '788', tr: '792', tm: '795', tc: '796', tv: '798', ug: '800',
  ua: '804', ae: '784', gb: '826', us: '840', uy: '858', uz: '860', vu: '548', ve: '862',
  vn: '704', vg: '092', vi: '850', ye: '887', zm: '894', zw: '716',
}

export function getNumericFromAlpha2(alpha2: string): string | null {
  return ISO_ALPHA2_TO_NUMERIC[alpha2.toLowerCase()] ?? null
}
