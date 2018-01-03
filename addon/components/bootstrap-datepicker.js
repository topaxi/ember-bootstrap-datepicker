import Ember from 'ember';
import DatepickerSupport from 'ember-bootstrap-datepicker/components/datepicker-support';
import { isEmpty } from "@ember/utils"
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

    let date = null,
        format = this.get('format');

    if (!isEmpty(this.element.value) && !isEmpty(format)) {
      let dpg = $.fn.datepicker.DPGlobal;
      date = dpg.parseDate(this.element.value, dpg.parseFormat(format));
    } else {
      date = Date.parse(this.element.value);
    }

    if (!isNaN(date)) {
      this.set('value', new Date(date));
    }
  }
});
