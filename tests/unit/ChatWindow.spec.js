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
