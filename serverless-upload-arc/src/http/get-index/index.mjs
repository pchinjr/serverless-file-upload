// learn more about HTTP functions here: https://arc.codes/http
export async function handler (req) {
  return {
    statusCode: 200,
    headers: {
      'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
      'content-type': 'text/html; charset=utf8'
    },
    body: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Architect</title>
  <style>
     * { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; } .max-width-320 { max-width: 20rem; } .margin-left-8 { margin-left: 0.5rem; } .margin-bottom-16 { margin-bottom: 1rem; } .margin-bottom-8 { margin-bottom: 0.5rem; } .padding-32 { padding: 2rem; } .color-grey { color: #333; } .color-black-link:hover { color: black; } 
  </style>
</head>
<body class="padding-32">
  <div class="max-width-320">
    <img src="https://assets.arc.codes/logo.svg" />
    <div class="margin-left-8">
      <div class="margin-bottom-16">
        <h1 class="margin-bottom-16">
          PRAISE CAGE!
        </h1>
        <p class="margin-bottom-8">
          Get started by editing this file at:
        </p>
        <code>
          serverless-upload-arc/src/http/get-index/index.mjs
        </code>
      </div>
      <div>
      <form method="POST" enctype="multipart/form-data" action="/upload">
      <input type="file" name="upload">
      <input type="submit">
      </form>
      </div>
    </div>
  </div>
</body>
</html>
`
  }
}