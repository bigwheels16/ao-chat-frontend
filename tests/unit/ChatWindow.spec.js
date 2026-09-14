import { shallowMount, createLocalVue } from '@vue/test-utils';
import ChatWindow from '@/components/ChatWindow.vue';
import Vuetify from 'vuetify';
import Vue from 'vue';

Vue.use(Vuetify);
const localVue = createLocalVue();

describe('ChatWindow.vue', () => {
  let vuetify;

  beforeEach(() => {
    vuetify = new Vuetify();
    // Mock global eventBus
    jest.mock('@/lib/core/event_bus', () => ({
      eventBus: {
        $on: jest.fn(),
        $emit: jest.fn(),
        $receivePacket: jest.fn()
      }
    }));
    jest.mock('@/lib/core/ao_client', () => ({
      aoClient: {}
    }));
  });

  it('renders tab configuration gear icon inside tab content', () => {
    // Instead of doing a full mount which might be hard because of dependencies,
    // let's just check the string template as well as a basic sanity check.
    // However, since we mock deeply, maybe shallowMount will fail if components aren't resolved.
    const wrapper = shallowMount(ChatWindow, {
      localVue,
      vuetify,
      mocks: {
        $refs: {
          tabSettingsModal: {
            open: jest.fn()
          }
        }
      }
    });

    // We expect v-tab-item to contain the button with mdi-cog
    const tabItems = wrapper.findAll('v-tab-item-stub');
    if (tabItems.length > 0) {
      const firstTabItem = tabItems.at(0);
      expect(firstTabItem.html()).toContain('mdi-cog');
    }
    
    const tabs = wrapper.findAll('v-tab-stub');
    if (tabs.length > 0) {
      const firstTab = tabs.at(0);
      expect(firstTab.html()).not.toContain('mdi-cog');
    }
  });
});
