// 出力：.dc.html（キャンバス用）と、手元確認用のプレビュー HTML
import { FONT_LINK, BASE_CSS } from './lib.mjs';

const EMPTY_LOGIC = `class Component extends DCLogic {
  renderVals() {
    return {};
  }
}`;

export function dcFile({ title, root, w, h, css = '', logic = EMPTY_LOGIC }) {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>${title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="${FONT_LINK}">
<style>
${BASE_CSS}
${css}
</style>
</helmet>
${root}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${w},"height":${h}}}'>
${logic}
</script>
</body>
</html>
`;
}

export function previewFile({ title, root, css = '' }) {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>${title}</title>
<link rel="stylesheet" href="${FONT_LINK}">
<style>
${BASE_CSS}
${css}
</style>
</head>
<body>
${root}
</body>
</html>
`;
}
