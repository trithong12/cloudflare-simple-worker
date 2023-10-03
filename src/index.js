export default {
	async fetch(req, env, ctx) {

    const url = new URL(req.url);
    const subpaths = url.pathname.split("/")

    // case of /secure
    if (url.pathname === "/secure") {
      const EMAIL = req.headers.get('cf-access-authenticated-user-email')
      const COUNTRY = req.headers.get('cf-ipcountry')
      const TIMESTAMP = Date.now()

      const html = `<!DOCTYPE html>
      <body>
        <p>${EMAIL} authenticated at ${TIMESTAMP} from <a href="/secure/${COUNTRY}">${COUNTRY}</a></p>
      </body>`;

      return new Response(html, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
        },
      });
    }
    // case of /secure/${COUNTRY}
    else if (subpaths.length === 3) {
      const key = url.pathname.split("/")[2].toLowerCase() + ".svg"
      const object = await env.NATION_FLAGS_BUCKET.get(key);

      if (object === null) {
        return new Response("<!DOCTYPE html><body>Nation flag not found!</body>", {
          status: 404,
          headers: { "content-type": "text/html;charset=UTF-8" }
        });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      headers.set('content-type', 'image/svg+xml') // Set appropriate content-type

      return new Response(object.body, {
        headers,
      });
    }

    return new Response("<!DOCTYPE html><body>Page not found!</body>", {
      status: 404,
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
	},
};
