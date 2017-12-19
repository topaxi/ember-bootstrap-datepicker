import Ember from 'ember';
import DatepickerSupport from 'ember-bootstrap-datepicker/components/datepicker-support';
import $ from 'jquery';

export default Ember.Component.extend(DatepickerSupport, {
  instrumentDisplay: '{{input type="text"}}',

  classNames: ['ember-text-field'],

  tagName: 'input',

  attributeBindings: [
    'accesskey',
    'autocomplete',
    'autofocus',
    'contenteditable',
    'contextmenu',
    'dir',
    'disabled',
    'draggable',
    'dropzone',
    'form',
    'hidden',
    'id',
    'lang',
    'list',
    'max',
    'min',
    'name',
    'placeholder',
    'readonly',
    'required',
    'spellcheck',
    'step',
    'tabindex',
    'title',
    'translate',
    'type'
  ],

  type: 'text',

  forceParse: true,

  focusOut() {
    if (this.get('forceParse')) {
      this._forceParse();
    }
  },

  _forceParse() {

    let dpg = $.fn.datepicker.DPGlobal;
    let date = dpg.parseDate(this.element.value, dpg.parseFormat(this.get('format')));

    if (!isNaN(date)) {
      this.set('value', new Date(date));
    }
  }
});
