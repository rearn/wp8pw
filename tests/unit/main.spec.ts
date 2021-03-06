/* eslint-disable vue/max-len */
import { shallowMount } from '@vue/test-utils';
import Main from '@/components/index/Main.vue';

describe('Main.vue', () => {
  it('href', () => {
    const user = 'aaaaa';
    const wrapper = shallowMount(Main, {
      propsData: { user },
    });
    expect((wrapper.find('a').element as HTMLAnchorElement).href).toMatch(`https://twitter.com/${user}`);
  });
  it('msg', () => {
    const user = 'bbb';
    const wrapper = shallowMount(Main, {
      propsData: { user },
    });
    expect((wrapper.find('a').element as HTMLAnchorElement).text).toMatch(`@${user}`);
  });
});
