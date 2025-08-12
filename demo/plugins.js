import OscdMenuOpen from '@omicronenergy/oscd-menu-open';
import OscdMenuSave from '@omicronenergy/oscd-menu-save';
import OscdBackgroundEditV1 from '@omicronenergy/oscd-background-editv1';

import OscdEditorTemplateGenerator from '../oscd-editor-template-generator.js';

customElements.define('oscd-menu-open', OscdMenuOpen);
customElements.define('oscd-menu-save', OscdMenuSave);
customElements.define('oscd-background-editv1', OscdBackgroundEditV1);

customElements.define(
  'oscd-editor-template-generator',
  OscdEditorTemplateGenerator,
);

export const plugins = {
  menu: [
    {
      name: 'Open File',
      translations: { de: 'Datei öffnen' },
      icon: 'folder_open',
      tagName: 'oscd-menu-open',
    },
    {
      name: 'Save File',
      translations: { de: 'Datei speichern' },
      icon: 'save',
      requireDoc: true,
      tagName: 'oscd-menu-save',
    },
  ],
  editor: [
    {
      name: 'Template Generator',
      translations: { de: 'Template Generator' },
      icon: 'add_box',
      active: true,
      tagName: 'oscd-editor-template-generator',
    },
    {
      name: 'Template Editor',
      translations: { de: 'Template Editor' },
      icon: 'edit',
      active: true,
      src: 'https://openenergytools.github.io/scl-template/scl-template.js',
    },
  ],
  background: [
    {
      name: 'EditV1 Events Listener',
      icon: 'none',
      requireDoc: true,
      tagName: 'oscd-background-editv1',
    },
  ],
};
