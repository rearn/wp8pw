// eslint-disable-next-line import/no-extraneous-dependencies
import express from 'express';
import axios from 'axios';
import { UriString } from '../../../modules/des';
import * as store from '../../../modules/store';

const router = express.Router();
// eslint-disable-next-line vue/max-len
const uriRe = /^https?:\/\/((([a-z]|[0-9]|[-._~])|%[0-9a-f][0-9a-f]|[!$&'()*+,;=]|:)*@)?(\[((([0-9a-f]{1,4}:){6}([0-9a-f]{1,4}:[0-9a-f]{1,4}|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])){3})|::([0-9a-f]{1,4}:){5}([0-9a-f]{1,4}:[0-9a-f]{1,4}|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])){3})|([0-9a-f]{1,4})?::([0-9a-f]{1,4}:){4}([0-9a-f]{1,4}:[0-9a-f]{1,4}|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])){3})|(([0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::([0-9a-f]{1,4}:){3}([0-9a-f]{1,4}:[0-9a-f]{1,4}|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])){3})|(([0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::([0-9a-f]{1,4}:){2}([0-9a-f]{1,4}:[0-9a-f]{1,4}|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])){3})|(([0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:([0-9a-f]{1,4}:[0-9a-f]{1,4}|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])){3})|(([0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::([0-9a-f]{1,4}:[0-9a-f]{1,4}|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])){3})|(([0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(([0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|v[0-9a-f]+\.(([a-z]|[0-9]|[-._~])|[!$&'()*+,;=]|:)+)]|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])){3}|(([a-z]|[0-9]|[-._~])|%[0-9a-f][0-9a-f]|[!$&'()*+,;=])*)(:\d*)?(\/((([a-z]|[0-9]|[-._~])|%[0-9a-f][0-9a-f]|[!$&'()*+,;=]|[:@]))*)*(\?((([a-z]|[0-9]|[-._~])|%[0-9a-f][0-9a-f]|[!$&'()*+,;=]|[:@])|[/?])*)?(#((([a-z]|[0-9]|[-._~])|%[0-9a-f][0-9a-f]|[!$&'()*+,;=]|[:@])|[/?])*)?$/i;

router.post('/accept/post', async (req, res) => {
  const { uri } = req.body;
  /* istanbul ignore if */
  if (!uriRe.test(uri)) {
    return res.status(400).end();
  }
  /* istanbul ignore if */
  if (store.recaptcha.use) {
    /* istanbul ignore next */
    const recaptchaRes: string|undefined = req.body['g-recaptcha-response'];
    /* istanbul ignore if */
    if (recaptchaRes === undefined) {
      return res.status(403).end();
    }
    /* istanbul ignore next */
    // eslint-disable-next-line vue/max-len
    const u = `https://www.google.com/recaptcha/api/siteverify?secret=${store.recaptcha.secretkey}&response=${recaptchaRes}`;
    /* istanbul ignore next */
    const j = await axios.get(u, {
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'json',
    });
    /* istanbul ignore if */
    if (!j.data.success) {
      return res.status(403).end();
    }
  }
  const type: boolean|undefined = req.body.antenna;
  /* istanbul ignore if */
  if (type === undefined) {
    return res.status(400).end();
  }

  const id: string = await store.dbi.update(uri, type);
  const retUri: UriString = store.c.encrypt(id);
  return res.json(retUri);
});
router.get('/recaptcha.json', async (req, res) => res.json({
  use: store.recaptcha.use,
  sitekey: store.recaptcha.sitekey,
}));
export default router;
