import { shallowMount, createLocalVue } from '@vue/test-utils';
import ChatWindow from '@/components/ChatWindow.vue';
import Vuetify from 'vuetify';
import Vue from 'vue';

Vue.use(Vuetify);
const localVue = createLocalVue();

describe('ChatWindow.vue', () => {
  it('shows the tab settings gear in each tab\'s content, not in the tab headers', () => {
    const wrapper = shallowMount(ChatWindow, { localVue, vuetify: new Vuetify() });

    const tabItems = wrapper.findAll('v-tab-item-stub');
    expect(tabItems.length).toBeGreaterThan(0);
    tabItems.wrappers.forEach(item => expect(item.html()).toContain('mdi-cog'));

    const tabs = wrapper.findAll('v-tab-stub');
    expect(tabs.length).toBe(tabItems.length);
    tabs.wrappers.forEach(tab => expect(tab.html()).not.toContain('mdi-cog'));
  });
});

describe('ChatWindow.vue cleanHtml', () => {
  let cleanHtml;

  beforeAll(() => {
    const wrapper = shallowMount(ChatWindow, { localVue, vuetify: new Vuetify() });
    cleanHtml = html => {
      const template = document.createElement('template');
      template.innerHTML = wrapper.vm.cleanHtml(html);
      return template.content;
    };
  });

  // The text a click handler's base64 argument decodes to
  const handlerArgument = (onclick, fn) => {
    const match = onclick.match(new RegExp(`^${fn}\\('([A-Za-z0-9+/=]*)'\\); return false;$`));
    expect(match).not.toBeNull();
    return Buffer.from(match[1], 'base64').toString();
  };

  it('removes scripts, event handlers and javascript: links', () => {
    expect(cleanHtml('<img src=x onerror=alert(1)>').querySelector('img').hasAttribute('onerror')).toBe(false);
    expect(cleanHtml('<font color=red>hi</font><script>alert(1)</script>').querySelector('script')).toBeNull();
    expect(cleanHtml('<a href="javascript:alert(1)">x</a>').querySelector('a').hasAttribute('href')).toBe(false);
  });

  it('turns item and icon references into auno.org links', () => {
    const link = cleanHtml('<a href="itemref://123/456/200">item</a>').querySelector('a');
    expect(link.getAttribute('href')).toBe('https://auno.org/ao/db.php?id=123&ql=200');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(cleanHtml('<img src="rdb://12345">').querySelector('img').getAttribute('src'))
      .toBe('https://u3.auno.org/res/aoicons/12345.gif');
  });

  it('opens blobs with their content sanitized', () => {
    const link = cleanHtml('<a href="text://<img src=x onerror=alert(1)>">blob</a>').querySelector('a');
    expect(link.hasAttribute('href')).toBe(false);
    expect(handlerArgument(link.getAttribute('onclick'), 'showBlobWindow')).toBe('<img src="x">');
  });

  it('turns user and chat command links into chat commands', () => {
    const tell = cleanHtml('<a href="user://Someone">Someone</a>').querySelector('a');
    expect(handlerArgument(tell.getAttribute('onclick'), 'chatCommand')).toBe('/tell Someone');
    const command = cleanHtml('<a href="chatcmd:///tell Bot help">help</a>').querySelector('a');
    expect(handlerArgument(command.getAttribute('onclick'), 'chatCommand')).toBe('/tell Bot help');
  });

  it('keeps quotes in a link from adding attributes', () => {
    const link = cleanHtml('<a href="user://x\' onmouseover=alert(1) \'">q</a>').querySelector('a');
    expect(link.hasAttribute('onmouseover')).toBe(false);
    expect(handlerArgument(link.getAttribute('onclick'), 'chatCommand')).toBe('/tell x\' onmouseover=alert(1) \'');
  });
});
