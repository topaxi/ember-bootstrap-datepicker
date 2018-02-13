import { typeOf, isNone } from '@ember/utils';
import { observer } from '@ember/object';
import Mixin from '@ember/object/mixin';
import { on } from '@ember/object/evented';
import { run } from '@ember/runloop';

export default Mixin.create({
  mustUpdateInput: true,
  value: null,
  // add the observed properties
  minViewMode: undefined,
  format: undefined,
  language: undefined,
  startDate: undefined,
  endDate: undefined,
  customParser(value) {
    return value;
  },

  setupBootstrapDatepicker: on('didInsertElement', function() {
    this.$().
      datepicker({
        autoclose: this.get('autoclose'),
        calendarWeeks: this.get('calendarWeeks'),
        clearBtn: this.get('clearBtn'),
        container: this.get('widgetContainer'),
        daysOfWeekDisabled: this.get('daysOfWeekDisabled'),
        defaultViewDate: this.get('defaultViewDate'),
        disableTouchKeyboard: this.get('disableTouchKeyboard'),
        enableOnReadonly: this.get('enableOnReadonly'),
        endDate: this.get('endDate'),
        forceParse: this.get('forceParse'),
        format: this._toString(this.get('format')),
        immediateUpdates: this.get('immediateUpdates'),
        keyboardNavigation: this.get('keyboardNavigation'),
        language: this.get('language') || undefined,
        maxViewMode: this.get('maxViewMode'),
        minViewMode: this.get('minViewMode'),
        multidate: this.get('multidate'),
        multidateSeparator: this.get('multidateSeparator'),
        orientation: this.get('orientation'),
        showOnFocus: this.get('showOnFocus'),
        startDate: this.get('startDate'),
        startView: this.get('startView'),
        todayBtn: this.get('todayBtn'),
        todayHighlight: this.get('todayHighlight'),
        toggleActive: this.get('toggleActive'),
        weekStart: this.get('weekStart'),
        datesDisabled: this.get('datesDisabled')
      }).
      on('changeDate', event => {
        run(() => {
          this._didChangeDate(event);
        });
      }).
      on('changeMonth', event => {
        // eslint-disable-next-line
        this.sendAction('changeMonth', event.date);
      }).
      on('focusout', event => {
        // eslint-disable-next-line
        this.sendAction('focus-out', this, event);
      }).
      on('focusin', event => {
        // eslint-disable-next-line
        this.sendAction('focus-in', this, event);
      }).
      on('clearDate', event => {
        run(() => {
          this._didChangeDate(event);
        });
      }).
      on('show', () => {
        // eslint-disable-next-line
        this.sendAction('show');
      }).
      on('hide', () => {
        // eslint-disable-next-line
        this.sendAction('hide');
      });

    this._updateDatepicker();
  }),

  teardownBootstrapDatepicker: on('willDestroyElement', function() {
    this.$().datepicker('destroy');
  }),

  didChangeValue: observer('value', function() {
    this._updateDatepicker();
  }),

  _didChangeDate(event) {
    let value = null;

    if (event.date) {
      if (this.get('multidate')) {
        value = this.$().datepicker('getDates');
      } else {
        value = this.$().datepicker('getDate');
      }
    }

    this.set('mustUpdateInput', false);
    this.set('value', value);
    if (event.type === 'clearDate') {
      // eslint-disable-next-line
      this.sendAction('clearDate');
    } else {
      // eslint-disable-next-line
      this.sendAction('changeDate', value);
    }
  },

  didInsertElement() {
    this.addObserver('language', function() {
      this.$().datepicker('destroy');
      this.setupBootstrapDatepicker();
    });

    this.addObserver('startDate', function() {
      this.$().datepicker('setStartDate', this.get('startDate'));
      this._updateDatepicker();
    });

    this.addObserver('endDate', function() {
      this.$().datepicker('setEndDate', this.get('endDate'));
      this._updateDatepicker();
    });

    this.addObserver('datesDisabled', function() {
      this.$().datepicker('setDatesDisabled', this.get('datesDisabled'));
      this._updateDatepicker();
    });

    this.addObserver('minViewMode', function() {
      this.$().datepicker('minViewMode', this.get('minViewMode'));
      this.$().data('datepicker')._process_options({minViewMode: this.get('minViewMode')});
      this._updateDatepicker();
    });

    this.addObserver('format', function() {
      let format = this._toString(this.get('format'));
      this.$().datepicker('format', format);
      this.$().data('datepicker')._process_options({format: format});
      this._updateDatepicker();
    });
  },

  _updateDatepicker() {
    let element = this.$();
    let value = this.get('value');
    let customParser = this.get('customParser');
    let dates = [];

    if (!this.get('mustUpdateInput')) {
      this.set('mustUpdateInput', true);
      return;
    }

    value = customParser(value);

    switch (typeOf(value)) {
      case 'array':
        dates = value;
        break;
      case 'date':
        dates = [value];
        break;
      default:
        dates = [null];
    }
    dates = dates.map(date =>
      isNone(date) ? null : this._getDateCloneWithNoTime(date)
    );

    element.datepicker('update', ...dates);
  },

  // HACK: Have to reset time to 00:00:00 because of the bug in
  //       bootstrap-datepicker
  //       Issue: http://git.io/qH7Hlg
  _getDateCloneWithNoTime(date) {
    let clone = new Date(date.getTime());

    clone.setHours(0);
    clone.setMinutes(0);
    clone.setSeconds(0);
    clone.setMilliseconds(0);

    return clone;
  },

  /**
   * Fix Issue #59
   * _toString Checks and converts the input object and returns  a String if it is required and feasible
   * @param  {Object} obj The object to check
   * @return {Object} The object as a String
   */
  _toString(obj) {
    if (obj !== undefined && obj !== 'function') {
      if (typeof obj.toString === 'function') {
        obj = obj.toString();
      } else {
        // No toString() method available - There is nothing else that can be done
        throw new Error("At _toString() (datepicker-support.js) - No toString() method available for the passed object.");
      }
    }
    return obj;
  }
});
