import render from '../dist/wechat';

const config = {
  origin: 'https://test.miniprogram.com',
  entry: '/',
  router: {
    home: [
      {regexp: '^(?:\\/home)?(?:\\/)?$', options: 'i'},
      {regexp: '^\\/index\\/(aaa|bbb)(?:\\/)?$', options: 'i'}
    ],
    list: [
      {regexp: '^\\/index\\/aaa\\/list\\/([^\\/]+?)(?:\\/)?$', options: 'i'},
      {regexp: '^\\/index\\/bbb\\/list\\/([^\\/]+?)(?:\\/)?$', options: 'i'}
    ],
    detail: [
      {regexp: '^\\/index\\/aaa\\/detail\\/([^\\/]+?)(?:\\/)?$', options: 'i'},
      {regexp: '^\\/index\\/bbb\\/detail\\/([^\\/]+?)(?:\\/)?$', options: 'i'}
    ],
  },
  runtime: {
    subpackagesMap: {},
  },
  pages: {
    home: {
      loadingText: '拼命加载页面中...',
      share: true,
      windowScroll: false,
      backgroundColor: '#F7F7F7',
      reachBottom: true,
      reachBottomDistance: 200,
      pullDownRefresh: true
    },
    list: {
      loadingText: '拼命加载页面中...',
      share: true,
      windowScroll: false,
      backgroundColor: '#F7F7F7'
    },
    detail: {
      loadingText: '拼命加载页面中...',
      share: true,
      windowScroll: false,
      backgroundColor: '#F7F7F7'
    },
  },
  redirect: {
    notFound: 'home',
    accessDenied: 'home'
  },
  optimization: {
    elementMultiplexing: true,
    textMultiplexing: true,
    commentMultiplexing: true,
    domExtendMultiplexing: true,
    styleValueReduce: 1000,
    attrValueReduce: 1000,
  }
};

const html = `<div class="aa">
    <div id="bb" class="bb">
        <header>
            <div class="bb1">123</div>
            <div class="bb2" data-a="123">321</div>
        </header>
        <div class="bb3">middle</div>
        <footer>
            <span id="bb4" class="bb4" data-index=1>1</span>
            <span class="bb4" data-index=2>2</span>
            <span class="bb4" data-index=3>3</span>
        </footer>
        <div>tail</div>
    </div>
</div>`;

global.wx = {
  redirectTo(options) {
    if (typeof global.expectCallMethod === 'string') expect(global.expectCallMethod).toBe('redirectTo');
    if (typeof global.expectPagePath === 'string') expect(options.url).toBe(global.expectPagePath);
  },
  navigateTo(options) {
    if (typeof global.expectCallMethod === 'string') expect(global.expectCallMethod).toBe('navigateTo');
    if (typeof global.expectPagePath === 'string') expect(options.url).toBe(global.expectPagePath);
  },
  getImageInfo(options) {
    setTimeout(() => {
      if (global.expectSuccess) {
        options.success({
          width: 100,
          height: 88,
        });
      } else {
        options.fail();
      }
    }, 10);
  },
  login() {}
};

export default {
  html,
  createPage(type = 'home', realUrl) {
    const route = `pages/${type}/index`;
    const res = render.createPage(route, config);
    realUrl = realUrl || (type === 'home' ? '/' : type === 'list' ? '/index/aaa/list/123' : 'index/aaa/detail/123');
    res.window.$$miniprogram.init(realUrl);
    res.document.body.innerHTML = html;

    return res;
  },
  async sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }
};
