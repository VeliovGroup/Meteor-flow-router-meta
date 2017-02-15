import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

if (Meteor.isServer) {
  return false;
}

FlowRouter.globals.push({
  title: 'Default title'
});

FlowRouter.globals.push({
  link: {
    twbs: {
      rel: 'stylesheet',
      href: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css'
    },
    canonical: {
      rel: 'canonical',
      itemprop: 'url',
      href() {
        return Meteor.absoluteUrl((FlowRouter.current().path || document.location.pathname).replace(/^\//g, ''));
      }
    }
  }
});

FlowRouter.globals.push({
  script: {
    twbs: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js'
  }
});

FlowRouter.globals.push({
  meta: {
    robots: 'index, follow'
  }
});

FlowRouter.notFound = {
  action() {},
  title: '404: Page not found',
  meta: {
    robots: 'noindex, nofollow',
    description: 'Non-existent route'
  },
  link: {
    twbs: null,
    canonical() {
      return Meteor.absoluteUrl((FlowRouter.current().path || document.location.pathname).replace(/^\//g, ''));
    }
  }
};

FlowRouter.route('/', {
  name: 'index',
  action() {}
});

FlowRouter.route('/secondPage', {
  name: 'secondPage',
  title: 'Second Page title',
  meta: {
    robots: 'index, follow',
    description: 'Second Page description'
  },
  link: {
    twbs: {
      rel: 'stylesheet',
      href: 'https://maxcdn.bootstrapcdn.com/bootstrap/2.2.0/css/bootstrap.min.css'
    }
  },
  script: {
    twbs: 'https://maxcdn.bootstrapcdn.com/bootstrap/2.2.0/js/bootstrap.min.js'
  },
  action() {}
});

FlowRouter.route('/unset', {
  name: 'unset',
  title: 'Unset Page title',
  meta: {
    robots: null,
    description: null
  },
  link: {
    twbs: null
  },
  script: {
    twbs: null
  },
  action() {}
});

FlowRouter.route('/thirdPage/:something', {
  name: 'thirdPage',
  title() {
    return 'Third Page Title > ' + this.params.something;
  },
  meta () {
    return {
      'og:title' () {
        return 'Third Page Title > ' + this.params.something;
      },
      description: 'Third Page description ' + this.params.something
    };
  },
  action() {}
});

group = FlowRouter.group({
  prefix: '/group',
  title: 'GROUP TITLE',
  titlePrefix: 'Group > ',
  meta() {
    return {
      'og:title'() {
        return 'Group lvl 1';
      },
      description: 'Group lvl 1'
    };
  }
});

group.route('/groupPage1', {
  name: 'groupPage1',
  title: 'Group lvl 1',
  action() {}
});

nestedGroup = group.group({
  prefix: '/level2',
  title: 'LEVEL2 GROUP TITLE',
  titlePrefix: 'Group Level 2 > ',
  meta() {
    return {
      description() {
        return 'Group lvl 2';
      }
    };
  }
});

nestedGroup.route('/withoutTitle', {
  name: 'lvl2',
  title: 'Group lvl 2',
  action() {}
});

import { FlowRouterMeta, FlowRouterTitle } from 'meteor/ostrio:flow-router-meta';
new FlowRouterTitle(FlowRouter);
new FlowRouterMeta(FlowRouter);
FlowRouter.go('/');

Tinytest.addAsync('Global Defaults', function (test, next) {
  setTimeout(() => {
    test.equal(document.title, 'Default title');
    test.equal($('link[data-name="twbs"]').attr('href'), 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css');
    test.equal($('link[data-name="twbs"]').attr('rel'), 'stylesheet');

    test.equal($('script[data-name="twbs"]').attr('src'), 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js');

    test.equal($('link[data-name="canonical"]').attr('href'), Meteor.absoluteUrl((FlowRouter.current().path || document.location.pathname).replace(/^\//g, '')));
    test.equal($('link[data-name="canonical"]').attr('rel'), 'canonical');
    test.equal($('link[data-name="canonical"]').attr('itemprop'), 'url');

    next();
  }, 100);
});

Tinytest.addAsync('Meta, script, link (CSS) - String', function (test, next) {
  FlowRouter.go('secondPage');
  setTimeout(() => {
    test.equal(document.title, 'Second Page title');

    test.equal($('meta[data-name="robots"]').attr('content'), 'index, follow');
    test.equal($('meta[data-name="robots"]').attr('name'), 'robots');
    test.equal($('meta[data-name="description"]').attr('content'), 'Second Page description');
    test.equal($('meta[data-name="description"]').attr('name'), 'description');

    test.equal($('link[data-name="twbs"]').attr('href'), 'https://maxcdn.bootstrapcdn.com/bootstrap/2.2.0/css/bootstrap.min.css');
    test.equal($('link[data-name="twbs"]').attr('rel'), 'stylesheet');

    test.equal($('script[data-name="twbs"]').attr('src'), 'https://maxcdn.bootstrapcdn.com/bootstrap/2.2.0/js/bootstrap.min.js');
    // Check defaults
    test.equal($('link[data-name="canonical"]').attr('href'), Meteor.absoluteUrl((FlowRouter.current().path || document.location.pathname).replace(/^\//g, '')));
    test.equal($('link[data-name="canonical"]').attr('rel'), 'canonical');
    test.equal($('link[data-name="canonical"]').attr('itemprop'), 'url');
    next();
  }, 100);
});

Tinytest.addAsync('Meta, script, link (CSS) - Function, dynamic', function (test, next) {
  var _str = Random.id();
  FlowRouter.go('thirdPage', {something: _str});
  setTimeout(() => {
    test.equal(document.title, 'Third Page Title > ' + _str);

    test.equal($('meta[data-name="description"]').attr('content'), 'Third Page description ' + _str);
    test.equal($('meta[data-name="description"]').attr('name'), 'description');
    test.equal($('meta[data-name="og:title"]').attr('content'), 'Third Page Title > ' + _str);
    test.equal($('meta[data-name="og:title"]').attr('name'), 'og:title');
    // Check defaults
    test.equal($('meta[data-name="robots"]').attr('content'), 'index, follow');
    test.equal($('meta[data-name="robots"]').attr('name'), 'robots');
    test.equal($('link[data-name="canonical"]').attr('href'), Meteor.absoluteUrl((FlowRouter.current().path || document.location.pathname).replace(/^\//g, '')));
    test.equal($('link[data-name="canonical"]').attr('rel'), 'canonical');
    test.equal($('link[data-name="canonical"]').attr('itemprop'), 'url');
    next();
  }, 100);
});

Tinytest.addAsync('Meta, script, link (CSS) - Unset via null', function (test, next) {
  FlowRouter.go('unset');
  setTimeout(() => {
    test.equal(document.title, 'Unset Page title');
    test.equal($('meta[data-name="description"]')[0], undefined);
    test.equal($('meta[data-name="description"]').attr('content'), undefined);
    test.equal($('meta[data-name="robots"]').attr('content'), undefined);
    test.equal($('link[data-name="twbs"]')[0], undefined);
    test.equal($('link[data-name="twbs"]').attr('href'), undefined);
    test.equal($('script[data-name="twbs"]')[0], undefined);
    test.equal($('script[data-name="twbs"]').attr('src'), undefined);
    // Check defaults
    test.equal($('link[data-name="canonical"]').attr('href'), Meteor.absoluteUrl((FlowRouter.current().path || document.location.pathname).replace(/^\//g, '')));
    next();
  }, 100);
});


Tinytest.addAsync('404 via FlowRouter.notFound', function (test, next) {
  FlowRouter.go('/not/exists/for/sure');
  setTimeout(() => {
    test.equal(document.title, '404: Page not found');
    test.equal($('meta[data-name="robots"]').attr('content'), 'noindex, nofollow');
    test.equal($('meta[data-name="robots"]').attr('name'), 'robots');
    test.equal($('meta[data-name="description"]').attr('content'), 'Non-existent route');
    test.equal($('meta[data-name="description"]').attr('name'), 'description');

    // Defaults should be used too
    test.equal($('link[data-name="twbs"]')[0], undefined);
    test.equal($('link[data-name="twbs"]').attr('href'), undefined);
    test.equal($('link[data-name="twbs"]').attr('rel'), undefined);

    test.equal($('script[data-name="twbs"]').attr('src'), 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js');

    test.equal($('link[data-name="canonical"]').attr('href'), Meteor.absoluteUrl((FlowRouter.current().path || document.location.pathname).replace(/^\//g, '')));
    test.equal($('link[data-name="canonical"]').attr('rel'), 'canonical');
    test.equal($('link[data-name="canonical"]').attr('itemprop'), undefined);
    next();
  }, 100);
});

Tinytest.addAsync('Group - level 1', function (test, next) {
  FlowRouter.go('groupPage1');
  setTimeout(() => {
    test.equal(document.title, 'Group > Group lvl 1');

    test.equal($('meta[data-name="description"]').attr('content'), 'Group lvl 1');
    test.equal($('meta[data-name="og:title"]').attr('content'), 'Group lvl 1');
    next();
  }, 100);
});

Tinytest.addAsync('Group - level 2', function (test, next) {
  FlowRouter.go('lvl2');
  setTimeout(() => {
    test.equal(document.title, 'Group > Group Level 2 > Group lvl 2');

    test.equal($('meta[data-name="description"]').attr('content'), 'Group lvl 2');
    test.equal($('meta[data-name="og:title"]').attr('content'), 'Group lvl 1');
    next();
  }, 100);
});