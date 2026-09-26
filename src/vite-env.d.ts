/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 公開する URL（末尾の / なし）。無ければ仮の URL。 */
  readonly VITE_SITE_URL?: string;
  /** "1" のときだけ検索に出す。公開の許可が出るまで入れない。 */
  readonly VITE_SITE_PUBLIC?: string;
  /** 楽天アフィリエイトの ID。無ければ、ふつうのリンクのまま。 */
  readonly VITE_RAKUTEN_AFFILIATE_ID?: string;
}
