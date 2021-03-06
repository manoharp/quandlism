(function(exports) { 
(function() {
  var QuandlismContext, QuandlismContext_, QuandlismLine, quandlism, quandlism_axis, quandlism_brush, quandlism_id_ref, quandlism_line_id, quandlism_stage, quandlism_xaxis, quandlism_yaxis_width,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  quandlism = exports.quandlism = {
    version: '0.9.6'
  };

  quandlism.context = function() {
    var allowTooltip, args, attributes, callbacks, colorList, context, dom, dombrush, domlegend, domstage, domtooltip, endDate, event, h, lines, options, padding, processes, startDate, startPoint, title, types, w, yAxisDualMax, yAxisDualMin, yAxisMax, yAxisMin,
      _this = this;
    context = new QuandlismContext();
    w = null;
    h = null;
    dom = null;
    domstage = null;
    dombrush = null;
    domlegend = null;
    domtooltip = null;
    yAxisMin = 100;
    yAxisMax = null;
    yAxisDualMin = null;
    yAxisDualMax = null;
    title = null;
    padding = 10;
    startPoint = 0.70;
    allowTooltip = true;
    startDate = null;
    endDate = null;
    event = d3.dispatch('respond', 'adjust', 'toggle', 'refresh');
    colorList = ['#e88033', '#4eb15d', '#c45199', '#6698cb', '#6c904c', '#e9563b', '#9b506f', '#d2c761', '#4166b0', '#44b1ae'];
    lines = [];
    processes = ["BUILD", "MERGE"];
    types = ['STAGE', 'BRUSH'];
    callbacks = {};
    options = {};
    args = {};
    attributes = {};
    context.addCallback = function(event, fn) {
      if (!((event != null) && _.isFunction(fn))) {
        return;
      }
      if (callbacks["" + event] == null) {
        callbacks["" + event] = [];
      }
      callbacks["" + event].push(fn);
    };
    context.runCallbacks = function(event) {
      var callback, _i, _len, _ref;
      if (!((callbacks["" + event] != null) && callbacks["" + event].length)) {
        return;
      }
      _ref = callbacks["" + event];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        callback = _ref[_i];
        callback();
      }
    };
    context.data = function(attributes, process) {
      var _ref;
      if (process == null) {
        process = "build";
      }
      if (!((process != null) && (_ref = process.toUpperCase(), __indexOf.call(processes, _ref) >= 0))) {
        throw "Unknown process " + process;
      }
      context.extractArguments();
      context.executeOptions();
      lines = context.utility()["" + (process.toLowerCase()) + "Lines"](attributes, lines != null ? lines : null);
      lines = context.utility().processLines(attributes, lines);
      context.bindToElements();
      context.runCallbacks(process);
      return context;
    };
    context.bindToElements = function() {
      if (domstage) {
        d3.select(domstage).datum(lines);
      }
      if (dombrush) {
        d3.select(dombrush).datum(lines);
      }
      if (domlegend) {
        d3.select(domlegend).datum(lines);
      }
      return context;
    };
    context.executeOptions = function() {
      var opt, value, _ref;
      _ref = context.options();
      for (opt in _ref) {
        value = _ref[opt];
        switch (opt) {
          case "reset":
            if (value === true) {
              context.resetState();
            }
        }
      }
      return context;
    };
    context.extractArguments = function() {
      var attr, value, _ref;
      _ref = context.args();
      for (attr in _ref) {
        value = _ref[attr];
        if (value == null) {
          continue;
        }
        try {
          context["" + (context.utility().camelize(attr))](value);
        } catch (_error) {}
      }
      return context;
    };
    context.render = function() {
      context.build();
      if (domstage) {
        d3.select(domstage).call(context.stage());
      }
      if (dombrush) {
        d3.select(dombrush).call(context.brush());
      }
      if (domlegend) {
        d3.select(domlegend).call(context.legend());
      }
      context.respond();
      context.runCallbacks('render');
      return context;
    };
    context.update = function(options) {
      if (options == null) {
        options = {};
      }
      context.build();
      context.respond();
      context.refresh();
      context.runCallbacks('update');
      return context;
    };
    context.build = function() {
      w = $(dom).width() - quandlism_yaxis_width;
      h = $(dom).height();
      return context;
    };
    context.chart = function(container, brush_) {
      var brush, brushId, stageId;
      if (!container.length) {
        throw 'Invalid container';
      }
      brush = brush_ != null ? brush_ : true;
      container.children().remove();
      if (container.attr('id') == null) {
        container.attr('id', "quandlism-" + (++quandlism_id_ref));
      }
      dom = "#" + (container.attr('id'));
      stageId = "quandlism-stage-" + (++quandlism_id_ref);
      container.append("<div class='stage' id='" + stageId + "'></div>");
      domstage = "#" + stageId;
      if (brush) {
        brushId = "quandlism-brush-" + (++quandlism_id_ref);
        container.append("<div class='brush' id='" + brushId + "'></div>");
        dombrush = "#" + brushId;
      }
      return context;
    };
    context.withLegend = function(container) {
      if (!container.length) {
        throw 'Invalid container';
      }
      if (!container.attr('id')) {
        container.attr('id', "quandlism-legend-" + (++quandlism_id_ref));
      }
      domlegend = "#" + (container.attr('id'));
      return context;
    };
    context.addColorsIfNecessary = function(lines_) {
      var brightness, colorsNeeded, i, rgb;
      colorsNeeded = lines_.length - colorList.length;
      if (colorsNeeded < 0) {
        return;
      }
      brightness = 0.1;
      i = 0;
      while (i < colorsNeeded) {
        rgb = d3.rgb(colorList[i]).brighter(brightness);
        colorList.push(rgb.toString());
        i++;
      }
    };
    context.setAttribute = function(type, key, val) {
      var _name, _ref;
      type = type.toUpperCase();
      if (__indexOf.call(types, type) >= 0) {
        if ((_ref = attributes[_name = "" + type]) == null) {
          attributes[_name] = {};
        }
        attributes["" + type]["" + key] = val;
      }
      return context;
    };
    context.getAttribute = function(type, key) {
      var _ref;
      type = type.toUpperCase();
      if (__indexOf.call(types, type) < 0) {
        return null;
      }
      if (attributes["" + type] == null) {
        return null;
      }
      return (_ref = attributes["" + type]["" + key]) != null ? _ref : null;
    };
    context.resetState = function() {
      yAxisMin = yAxisMax = yAxisDualMin = yAxisDualMax = null;
    };
    context.lines = function(_) {
      if (!_) {
        return lines;
      }
      lines = _;
      return context;
    };
    context.colorList = function(_) {
      if (_ == null) {
        return colorList;
      }
      colorList = _;
      return context;
    };
    context.startPoint = function(_) {
      if (_ == null) {
        return startPoint;
      }
      startPoint = _;
      return context;
    };
    context.options = function(_) {
      if (_ == null) {
        return options;
      }
      options = _;
      return context;
    };
    context.args = function(_) {
      if (_ == null) {
        return args;
      }
      args = _;
      return context;
    };
    context.w = function(_) {
      if (_ == null) {
        return w;
      }
      w = _;
      return context;
    };
    context.h = function(_) {
      if (_ == null) {
        return h;
      }
      h = _;
      return context;
    };
    context.yAxisMin = function(_) {
      if (_ == null) {
        return yAxisMin;
      }
      yAxisMin = parseFloat(_);
      return context;
    };
    context.yAxisMax = function(_) {
      if (_ == null) {
        return yAxisMax;
      }
      yAxisMax = parseFloat(_);
      return context;
    };
    context.yAxisDualMin = function(_) {
      if (_ == null) {
        return yAxisDualMin;
      }
      yAxisDualMin = parseFloat(_);
      return context;
    };
    context.yAxisDualMax = function(_) {
      if (_ == null) {
        return yAxisDualMax;
      }
      yAxisDualMax = parseFloat(_);
      return context;
    };
    context.dom = function(_) {
      if (_ == null) {
        return dom;
      }
      dom = _;
      return context;
    };
    context.domstage = function(_) {
      if (_ == null) {
        return domstage;
      }
      domstage = _;
      return context;
    };
    context.dombrush = function(_) {
      if (_ == null) {
        return dombrush;
      }
      dombrush = _;
      return context;
    };
    context.domlegend = function(_) {
      if (_ == null) {
        return domlegend;
      }
      domlegend = _;
      return context;
    };
    context.padding = function(_) {
      if (_ == null) {
        return padding;
      }
      padding = _;
      return context;
    };
    context.callbacks = function(_) {
      if (_ == null) {
        return callbacks;
      }
      callbacks = _;
      return context;
    };
    context.allowTooltip = function(_) {
      if (_ == null) {
        return allowTooltip;
      }
      allowTooltip = _;
      return context;
    };
    context.title = function(_) {
      if (_ == null) {
        return title;
      }
      title = _;
      return context;
    };
    context.startDate = function(_) {
      if (_ == null) {
        return startDate;
      }
      startDate = _;
      return context;
    };
    context.endDate = function(_) {
      if (_ == null) {
        return endDate;
      }
      endDate = _;
      return context;
    };
    context.respond = _.throttle(function() {
      return event.respond.call(context, 500);
    });
    context.adjust = function(d1, i1, d2, i2) {
      event.adjust.call(context, d1, i1, d2, i2);
      return context.runCallbacks('adjust');
    };
    context.toggle = function() {
      event.toggle.call(context);
      return context.runCallbacks('toggle');
    };
    context.refresh = function() {
      event.refresh.call(context, options);
      context.runCallbacks('refresh');
    };
    context.on = function(type, listener) {
      if (listener == null) {
        return event.on(type);
      }
      event.on(type, listener);
      return context;
    };
    d3.select(window).on('resize', function() {
      var h0, w0;
      d3.event.preventDefault();
      if (dom) {
        w0 = $(dom).width();
        h0 = $(dom).height();
        if (w !== w0 || h !== h0) {
          w = w0 - 50;
          h = h0;
          context.respond();
        }
      }
    });
    return context;
  };

  QuandlismContext = (function() {

    function QuandlismContext() {}

    return QuandlismContext;

  })();

  QuandlismContext_ = QuandlismContext.prototype = quandlism.context.prototype;

  quandlism_axis = 0;

  quandlism_line_id = 0;

  quandlism_id_ref = 0;

  quandlism_yaxis_width = 40;

  quandlism_xaxis = {
    h: 0.10
  };

  quandlism_brush = {
    h: 0.15
  };

  quandlism_stage = {
    h: 0.65
  };

  QuandlismLine = (function() {

    function QuandlismLine() {}

    return QuandlismLine;

  })();

  QuandlismContext_.line = function(data) {
    var axisIndex, color, context, dates, datesMap, id, line, name, values, visible,
      _this = this;
    line = new QuandlismLine();
    context = this;
    name = data.name;
    values = data.values.reverse();
    dates = [];
    datesMap = [];
    id = quandlism_line_id++;
    visible = false;
    color = '#000000';
    axisIndex = 0;
    line.setup = function() {
      var v;
      dates = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = values.length; _i < _len; _i++) {
          v = values[_i];
          _results.push(v.date);
        }
        return _results;
      })();
      datesMap = _.map(dates, function(d) {
        return context.utility().getDateKey(d);
      });
      window.dates = dates;
      datesMap = datesMap;
    };
    line.setup();
    line.extent = function(start, end) {
      var i, max, min, n, val;
      i = start != null ? start : 0;
      n = end != null ? end : this.length() - 1;
      min = Infinity;
      max = -Infinity;
      if (!this.visible()) {
        return [min, max];
      }
      while (i <= n) {
        val = parseFloat(this.valueAt(i));
        if (val == null) {
          i++;
          continue;
        }
        if (val < min) {
          min = val;
        }
        if (val > max) {
          max = val;
        }
        i++;
      }
      return [min, max];
    };
    line.extentByDate = function(startDate, endDate) {
      var date, i, max, min, val, _i, _len, _ref;
      min = Infinity;
      max = -Infinity;
      if (!this.visible()) {
        return [min, max];
      }
      _ref = this.dates();
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        date = _ref[i];
        if (!(date <= endDate && date >= startDate)) {
          continue;
        }
        val = this.valueAt(i);
        if (val == null) {
          continue;
        }
        if (val < min) {
          min = val;
        }
        if (val > max) {
          max = val;
        }
      }
      return [min, max];
    };
    line.length = function() {
      return values.length;
    };
    line.valueAt = function(i) {
      if (values[i] != null) {
        return values[i].num;
      } else {
        return null;
      }
    };
    line.dateAt = function(i) {
      if (dates[i] != null) {
        return dates[i];
      } else {
        return null;
      }
    };
    line.firstValue = function() {
      var i;
      i = 0;
      while (i < this.length()) {
        if (this.valueAt(i)) {
          return this.valueAt(i);
        } else {
          i++;
        }
      }
      return null;
    };
    line.drawPointAtIndex = function(ctx, xS, yS, index, radius) {
      if (!this.visible()) {
        return;
      }
      ctx.beginPath();
      ctx.arc(xS(this.dateAt(index)), yS(this.valueAt(index)), radius, 0, Math.PI * 2, true);
      ctx.fillStyle = this.color();
      ctx.fill();
      return ctx.closePath();
    };
    line.drawPath = function(ctx, xS, yS, lineWidth) {
      var date, i, _i, _len, _ref;
      if (!this.visible()) {
        return;
      }
      ctx.beginPath();
      _ref = this.dates();
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        date = _ref[i];
        if (this.valueAt(i) == null) {
          continue;
        }
        ctx.lineTo(xS(date), yS(this.valueAt(i)));
      }
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = this.color();
      ctx.stroke();
      ctx.closePath();
    };
    line.drawPathFromIndicies = function(ctx, xS, yS, start, end, lineWidth) {
      var i, _i;
      if (!this.visible()) {
        return;
      }
      ctx.beginPath();
      for (i = _i = start; start <= end ? _i <= end : _i >= end; i = start <= end ? ++_i : --_i) {
        if (this.valueAt(i) == null) {
          continue;
        }
        ctx.lineTo(xS(this.dateAt(i)), yS(this.valueAt(i)));
      }
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = this.color();
      ctx.stroke();
      return ctx.closePath();
    };
    line.getClosestDataPoint = function(date) {
      var index;
      index = this.getClosestIndex(date);
      return values[index];
    };
    line.getClosestIndex = function(date) {
      var cloestIndex, closest, closestIndex, d, dateKey, diff, i, key, prevClosest, _i, _len;
      closest = Infinity;
      cloestIndex = 0;
      prevClosest = Infinity;
      dateKey = context.utility().getDateKey(date);
      for (i = _i = 0, _len = datesMap.length; _i < _len; i = ++_i) {
        d = datesMap[i];
        key = context.utility().getDateKey(d);
        diff = Math.abs(key - dateKey);
        if (diff < closest) {
          prevClosest = closest;
          closest = diff;
          closestIndex = i;
        } else if (prevClosest < diff) {
          break;
        }
      }
      return closestIndex;
    };
    line.drawPoints = function(ctx, xS, yS, dateStart, dateEnd, radius) {
      var date, i, _i, _len, _ref, _results;
      if (!this.visible()) {
        return;
      }
      _ref = this.dates();
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        date = _ref[i];
        if (!(date >= dateStart && date <= dateEnd)) {
          continue;
        }
        ctx.beginPath();
        ctx.arc(xS(date), yS(this.valueAt(i)), 3, 0, Math.PI * 2, true);
        ctx.fillStyle = this.color();
        ctx.fill();
        _results.push(ctx.closePath());
      }
      return _results;
    };
    line.resetState = function() {
      this.axisIndex(0);
    };
    line.toggle = function() {
      var v;
      v = !this.visible();
      this.visible(v);
      return v;
    };
    line.legendName = function() {
      if (this.axisIndex() === 0) {
        return this.name();
      }
      return "" + (this.name()) + " (RHS)";
    };
    line.dates = function(_) {
      if (_ == null) {
        return dates;
      }
      dates = _;
      return line;
    };
    line.id = function(_) {
      if (_ == null) {
        return id;
      }
      id = _;
      return line;
    };
    line.name = function(_) {
      if (_ == null) {
        return name;
      }
      name = _;
      return line;
    };
    line.values = function(_) {
      if (_ == null) {
        return values;
      }
      values = _;
      return line;
    };
    line.visible = function(_) {
      if (_ == null) {
        return visible;
      }
      visible = _;
      return line;
    };
    line.color = function(_) {
      if (_ == null) {
        return color;
      }
      color = _;
      return line;
    };
    line.axisIndex = function(_) {
      if (_ == null) {
        return axisIndex;
      }
      axisIndex = _;
      return line;
    };
    return line;
  };

  QuandlismContext_.stage = function() {
    var canvas, canvasId, canvasNode, context, ctx, dateEnd, dateStart, drawEnd, drawStart, extents, height, indexEnd, indexStart, line, lines, stage, threshold, width, xAxis, xScale, yAxes, yAxesDOMs, yScales,
      _this = this;
    context = this;
    canvasId = null;
    canvasNode = null;
    lines = [];
    line = null;
    width = Math.floor(context.w() - quandlism_yaxis_width - 2);
    height = context.utility().stageHeight();
    xScale = d3.time.scale();
    xAxis = d3.svg.axis().orient('bottom').scale(xScale);
    yScales = [d3.scale.linear(), d3.scale.linear()];
    yAxes = [d3.svg.axis().orient('left').scale(yScales[0]), d3.svg.axis().orient('right').scale(yScales[1])];
    yAxesDOMs = [];
    extents = [[], []];
    threshold = 10;
    dateStart = null;
    dateEnd = null;
    drawStart = null;
    drawEnd = null;
    indexStart = null;
    indexEnd = null;
    threshold = 10;
    canvas = null;
    ctx = null;
    stage = function(selection) {
      var clearTooltip, draw, drawAxis, drawGridLines, drawTooltip, i, insertAxisDOM, lineHit, prepareAxes, prepareCanvas, prepareLines, prepareToDraw, resetExtents, respondAxisDOM, setExtents, setExtentsFromUser, setScales, setTicks, setYAxisAttributesFromExtents, shouldShowDualAxes, stageCanvasStyle, xAxisDOM, _i;
      shouldShowDualAxes = function() {
        return context.utility().shouldShowDualAxes(indexStart, indexEnd);
      };
      stageCanvasStyle = function() {
        var style;
        style = "position: absolute; left: " + quandlism_yaxis_width + "px; top: 0px; border-left: 1px solid black; border-bottom: 1px solid black;";
        if (shouldShowDualAxes()) {
          style += "border-right: 1px solid black;";
        }
        return style;
      };
      insertAxisDOM = function(axisIndex) {
        return selection.insert("svg").attr("class", "y axis").attr("id", "y-axis-" + axisIndex + "-" + canvasId).attr("width", quandlism_yaxis_width).attr("height", height).attr("style", "position: absolute; left: " + context.w() * axisIndex + "px; top: 0px;");
      };
      if (canvasId == null) {
        canvasId = "canvas-stage-" + (++quandlism_id_ref);
      }
      lines = selection.datum();
      line = _.first(lines);
      selection.attr("style", "position: absolute; left: 0px; top: 0px;");
      for (i = _i = 0; _i <= 1; i = ++_i) {
        yAxesDOMs.push(insertAxisDOM(i));
      }
      canvas = selection.append('canvas');
      canvas.attr('width', width);
      canvas.attr('height', height);
      canvas.attr('class', 'canvas-stage');
      canvas.attr('id', canvasId);
      canvas.attr('title', context.title());
      canvas.attr('style', stageCanvasStyle());
      ctx = canvas.node().getContext('2d');
      xAxisDOM = selection.append('svg');
      xAxisDOM.attr('class', 'x axis');
      xAxisDOM.attr('id', "x-axis-" + canvasId);
      xAxisDOM.attr('width', Math.floor(context.w() - quandlism_yaxis_width));
      xAxisDOM.attr('height', height);
      xAxisDOM.attr('style', "position: absolute; left: " + quandlism_yaxis_width + "px; top: " + height + "px");
      respondAxisDOM = function(axisInd) {
        return yAxesDOMs[axisInd].attr('style', "position: absolute; left: " + (Math.floor(context.w()) * axisInd) + "px; top: 0px;");
      };
      resetExtents = function() {
        extents = [[], []];
      };
      setExtents = function() {
        var exe;
        resetExtents();
        setExtentsFromUser();
        if (extents[0].length && extents[1].length) {
          setYAxisAttributesFromExtents();
          return;
        }
        exe = context.utility().getExtent(lines, indexStart, indexEnd);
        if (_.first(exe) === _.last(exe)) {
          exe = context.utility().getExtent(lines, 0, _.first(lines).length());
        }
        if (_.first(exe) === _.last(exe)) {
          exe = [Math.floor(exe[0] / 2), Math.floor(exe[0] * 2)];
        }
        if (!context.utility().shouldShowDualAxes(indexStart, indexEnd)) {
          if (!extents[0].length) {
            extents[0] = exe;
          }
        } else {
          exe = context.utility().getMultiExtent(lines, indexStart, indexEnd);
          if (!extents[0].length) {
            extents[0] = exe[0];
          }
          if (!extents[1].length) {
            extents[1] = exe[1];
          }
        }
        setYAxisAttributesFromExtents();
      };
      setExtentsFromUser = function() {
        if ((context.yAxisMin() != null) && (context.yAxisMax() != null) && (context.yAxisMin() < context.yAxisMax())) {
          extents[0] = [context.yAxisMin(), context.yAxisMax()];
        }
        if ((context.yAxisDualMin() != null) && (context.yAxisDualMax() != null) && (context.yAxisDualMin() < context.yAxisDualMax())) {
          return extents[1] = [context.yAxisDualMin(), context.yAxisDualMax()];
        }
      };
      setYAxisAttributesFromExtents = function() {
        var _ref, _ref1, _ref2, _ref3;
        context.setAttribute('stage', 'y_axis_min', (_ref = extents[0][0]) != null ? _ref : null);
        context.setAttribute('stage', 'y_axis_max', (_ref1 = extents[0][1]) != null ? _ref1 : null);
        context.setAttribute('stage', 'y_axis_dual_min', (_ref2 = extents[1][0]) != null ? _ref2 : null);
        context.setAttribute('stage', 'y_axis_dual_max', (_ref3 = extents[1][1]) != null ? _ref3 : null);
      };
      setScales = function() {
        var scale, _j, _len;
        xScale.domain([dateStart, dateEnd]);
        xScale.range([0, width]);
        yScales[0].domain(extents[0]);
        yScales[1].domain(extents[1]);
        for (_j = 0, _len = yScales.length; _j < _len; _j++) {
          scale = yScales[_j];
          scale.range([height - context.padding(), context.padding()]);
        }
      };
      setTicks = function(unitsObj, axisIndex) {
        var val;
        val = Math.floor(context.w() / 75);
        xAxis.ticks(val);
        yAxes[axisIndex].ticks(Math.floor(context.h() * quandlism_stage.h / 30));
        yAxes[axisIndex].tickSize(5, 3, 0);
        yAxes[axisIndex].tickFormat(function(d) {
          var n;
          n = (d / unitsObj['divisor']).toFixed(3);
          n = n.replace(/0+$/, '');
          n = n.replace(/\.$/, '');
          return "" + n + unitsObj['label'];
        });
      };
      prepareAxes = function() {
        var units, _j;
        for (i = _j = 0; _j <= 1; i = ++_j) {
          if (i === 1 && !shouldShowDualAxes()) {
            continue;
          }
          units = context.utility().getUnitAndDivisor(Math.round(extents[i][1]));
          setTicks(units, i);
        }
      };
      prepareCanvas = function() {
        canvas.attr("style", stageCanvasStyle());
      };
      prepareLines = function() {
        var _j, _len;
        for (_j = 0, _len = lines.length; _j < _len; _j++) {
          line = lines[_j];
          line.resetState();
        }
      };
      prepareToDraw = function() {
        setExtents();
        setScales();
        prepareAxes();
        prepareCanvas();
        prepareLines();
      };
      drawAxis = function() {
        var g, xg, _j, _len, _ref;
        xAxisDOM.selectAll('*').remove();
        xg = xAxisDOM.append('g');
        xg.call(xAxis);
        xg.select('path').remove();
        _ref = [0, 1];
        for (_j = 0, _len = _ref.length; _j < _len; _j++) {
          i = _ref[_j];
          yAxesDOMs[i].selectAll('*').remove();
          if (i === 1 && !shouldShowDualAxes()) {
            continue;
          }
          g = yAxesDOMs[i].append('g');
          if (i === 0) {
            g.attr('transform', "translate(" + quandlism_yaxis_width + ", 0)");
          }
          g.call(yAxes[i]);
          g.select('path').remove();
        }
      };
      drawGridLines = function() {
        var x, y, yScale, _j, _k, _len, _len1, _ref, _ref1, _results;
        yScale = _.first(yScales);
        _ref = yScale.ticks(Math.floor(context.h() * quandlism_stage.h / 30));
        for (_j = 0, _len = _ref.length; _j < _len; _j++) {
          y = _ref[_j];
          ctx.beginPath();
          ctx.strokeStyle = '#EDEDED';
          ctx.lineWidth = 1;
          ctx.moveTo(0, Math.floor(yScale(y)));
          ctx.lineTo(width, Math.floor(yScale(y)));
          ctx.stroke();
          ctx.closePath();
        }
        _ref1 = xScale.ticks(Math.floor((context.w() - quandlism_yaxis_width) / 100));
        _results = [];
        for (_k = 0, _len1 = _ref1.length; _k < _len1; _k++) {
          x = _ref1[_k];
          ctx.beginPath();
          ctx.strokeStyle = '#EDEDED';
          ctx.lineWith = 1;
          ctx.moveTo(xScale(x), height);
          ctx.lineTo(xScale(x), 0);
          ctx.stroke();
          _results.push(ctx.closePath());
        }
        return _results;
      };
      draw = function(lineId) {
        var axisIndex, dual, ex, j, lineWidth, _j, _k, _l, _len;
        lineId = lineId != null ? lineId : -1;
        drawAxis();
        ctx.clearRect(0, 0, width, height);
        drawGridLines();
        dual = shouldShowDualAxes();
        for (j = _j = 0, _len = lines.length; _j < _len; j = ++_j) {
          line = lines[j];
          lineWidth = j === lineId ? 3 : 1.5;
          if (dual) {
            ex = line.extent(indexStart, indexEnd);
            axisIndex = Math.abs(extents[0][1] - ex[1]) <= Math.abs(extents[1][1] - ex[1]) ? 0 : 1;
            line.axisIndex(axisIndex);
            line.drawPathFromIndicies(ctx, xScale, yScales[axisIndex], indexStart, indexEnd, lineWidth);
            if ((indexEnd - indexStart) < threshold) {
              for (i = _k = indexStart; indexStart <= indexEnd ? _k <= indexEnd : _k >= indexEnd; i = indexStart <= indexEnd ? ++_k : --_k) {
                line.drawPointAtIndex(ctx, xScale, yScales[axisIndex], i, 2);
              }
            }
          } else {
            line.drawPathFromIndicies(ctx, xScale, yScales[0], indexStart, indexEnd, lineWidth);
            if ((indexEnd - indexStart) < threshold) {
              for (i = _l = indexStart; indexStart <= indexEnd ? _l <= indexEnd : _l >= indexEnd; i = indexStart <= indexEnd ? ++_l : --_l) {
                line.drawPointAtIndex(ctx, xScale, yScales[0], i, 2);
              }
            }
          }
        }
      };
      lineHit = function(m) {
        var hex, hitMatrix, j, k, n, _j, _k, _l, _ref, _ref1, _ref2, _ref3, _ref4;
        hex = context.utility().getPixelRGB(m, ctx);
        i = _.indexOf(context.colorList(), hex);
        if (i !== -1) {
          return {
            x: m[0],
            color: hex,
            line: lines[i]
          };
        }
        hitMatrix = [];
        for (j = _j = _ref = m[0] - 3, _ref1 = m[0] + 3; _ref <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = _ref <= _ref1 ? ++_j : --_j) {
          for (k = _k = _ref2 = m[1] - 3, _ref3 = m[1] + 3; _ref2 <= _ref3 ? _k <= _ref3 : _k >= _ref3; k = _ref2 <= _ref3 ? ++_k : --_k) {
            if (j !== m[0] || k !== m[1]) {
              hitMatrix.push([j, k]);
            }
          }
        }
        for (n = _l = 0, _ref4 = hitMatrix.length - 1; 0 <= _ref4 ? _l <= _ref4 : _l >= _ref4; n = 0 <= _ref4 ? ++_l : --_l) {
          hex = context.utility().getPixelRGB(hitMatrix[n], ctx);
          i = _.indexOf(context.colorList(), hex);
          if (i !== -1) {
            return {
              x: hitMatrix[n][0],
              color: hex,
              line: lines[i]
            };
          }
        }
        return false;
      };
      drawTooltip = function(loc, hit, dataIndex) {
        var date, inTooltip, line_, tooltipText, value, w;
        line_ = hit.line;
        date = line_.dateAt(dataIndex);
        value = parseFloat(line_.valueAt(dataIndex));
        if (_.isNaN(value)) {
          return;
        }
        draw(line_.id());
        if (extents[1][1] / extents[0][1] > 2 && Math.abs(line_.extent(indexStart, indexEnd)[1] - extents[1][1]) < Math.abs(line_.extent(indexStart, indexEnd)[1] - extents[0][1])) {
          line_.drawPointAtIndex(ctx, xScale, yScales[1], dataIndex, 3);
        } else {
          line_.drawPointAtIndex(ctx, xScale, yScales[0], dataIndex, 3);
        }
        inTooltip = loc[1] <= 20 && loc[0] >= (width - 250);
        w = inTooltip ? width - 400 : width;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(237, 237, 237, 0.80)';
        ctx.fillRect(w - 240, 0, 240, 15);
        ctx.closePath();
        ctx.fillStyle = '#000';
        ctx.textAlign = 'start';
        tooltipText = "" + (context.utility().getMonthName(date.getUTCMonth())) + "  " + (date.getUTCDate()) + ", " + (date.getFullYear()) + ": ";
        tooltipText += "" + (context.utility().formatNumberAsString(value.toFixed(2)));
        ctx.fillText(tooltipText, w - 110, 10, 100);
        ctx.fillStyle = line_.color();
        ctx.textAlign = 'end';
        ctx.fillText("" + (context.utility().truncate(line_.name(), 20)), w - 120, 10, 200);
      };
      clearTooltip = function() {
        draw();
      };
      if (context.dombrush() == null) {
        if (context.startDate()) {
          dateStart = context.startDate();
          indexStart = line.getClosestIndex(dateStart);
        } else {
          dateStart = _.first(lines[0].dates());
          indexStart = 0;
        }
        if (context.endDate()) {
          dateEnd = context.endDate();
          indexEnd = line.getClosestIndex(dateEnd);
        } else {
          dateEnd = _.last(lines[0].dates());
          indexEnd = line.length();
        }
        context.setAttribute('stage', 'start_date', dateStart);
        context.setAttribute('stage', 'end_date', dateEnd);
        prepareToDraw();
        draw();
      }
      context.on('respond.stage', function() {
        var _j;
        ctx.clearRect(0, 0, width, height);
        width = Math.floor(context.w() - quandlism_yaxis_width - 1);
        height = context.utility().stageHeight();
        canvas.attr('width', width);
        canvas.attr('height', height);
        for (i = _j = 0; _j <= 1; i = ++_j) {
          respondAxisDOM(i);
        }
        xAxisDOM.attr('width', Math.floor(context.w() - quandlism_yaxis_width));
        xAxisDOM.attr('height', Math.floor(context.utility().xAxisHeight()));
        prepareToDraw();
        draw();
      });
      context.on('adjust.stage', function(_dateStart, _indexStart, _dateEnd, _indexEnd) {
        indexStart = _indexStart;
        indexEnd = _indexEnd;
        dateStart = _dateStart;
        dateEnd = _dateEnd;
        prepareToDraw();
        draw();
      });
      context.on('toggle.stage', function() {
        if (!context.dombrush()) {
          context.resetState();
        }
        context.setAttribute('stage', 'visible_columns', context.utility().visibleColumns(lines));
        prepareToDraw();
        draw();
      });
      context.on('refresh.stage', function() {
        lines = selection.datum();
        line = _.first(lines);
        if (!context.dombrush()) {
          draw();
        }
      });
      d3.select("#" + canvasId).on('mousemove', function(e) {
        var dataIndex, hit, loc;
        if (!context.allowTooltip()) {
          return;
        }
        loc = d3.mouse(this);
        hit = lineHit(loc);
        if (hit) {
          dataIndex = hit.line.getClosestIndex(xScale.invert(hit.x));
        }
        if (hit !== false) {
          drawTooltip(loc, hit, dataIndex);
        } else {
          clearTooltip();
        }
      });
    };
    stage.canvasId = function(_) {
      if (_ == null) {
        return canvasId;
      }
      canvasId = _;
      return stage;
    };
    stage.xScale = function(_) {
      if (_ == null) {
        return xScale;
      }
      xScale = _;
      return stage;
    };
    stage.yScale = function(_) {
      var yScale;
      if (_ == null) {
        return yScale;
      }
      yScale = _;
      return stage;
    };
    stage.threshold = function(_) {
      if (_ == null) {
        return threshold;
      }
      threshold = _;
      return stage;
    };
    return stage;
  };

  QuandlismContext_.brush = function() {
    var activeHandle, brush, brushId, buffer, canvas, canvasId, context, ctx, dateEnd, dateStart, dragEnabled, dragging, drawEnd, drawStart, extent, handleWidth, height, line, lines, previous, stertchhMin, stretchLimit, stretching, threshold, touchPoint, useCache, width, xAxis, xScale, yScale,
      _this = this;
    context = this;
    height = Math.floor(context.h() * quandlism_brush.h);
    width = Math.floor(context.w() - quandlism_yaxis_width);
    dateStart = dateEnd = drawStart = drawEnd = line = null;
    dragging = dragEnabled = stretching = touchPoint = null;
    canvas = ctx = canvasId = brushId = null;
    extent = lines = [];
    xScale = d3.time.scale();
    yScale = d3.scale.linear();
    xAxis = d3.svg.axis().orient('bottom').scale(xScale);
    threshold = 10;
    handleWidth = 10;
    stretchLimit = 6;
    stertchhMin = 100;
    activeHandle = 0;
    buffer = document.createElement('canvas');
    useCache = false;
    previous = {};
    brush = function(selection) {
      var checkDragState, clearCanvas, dispatchAdjust, draw, drawAxis, drawBrush, drawFromCache, getPrevious, isDraggingLocation, isLeftHandle, isRightHandle, removeCache, saveCanvasData, saveState, setBrushClass, setBrushValues, setPrevious, setScales, update, xAxisDOM;
      if (canvasId == null) {
        canvasId = "canvas-brush-" + (++quandlism_id_ref);
      }
      lines = selection.datum();
      line = _.first(lines);
      dateStart = _.first(line.dates());
      dateEnd = _.last(line.dates());
      selection.attr("style", "position: absolute; top: " + (context.h() * (quandlism_stage.h + quandlism_xaxis.h)) + "px; left: " + quandlism_yaxis_width + "px");
      canvas = selection.append('canvas');
      canvas.attr('id', canvasId);
      canvas.attr('class', 'canvas-brush');
      canvas.attr("style", "position: absolute; left: 0px; top: 0px; border-bottom: 1px solid black;");
      ctx = canvas.node().getContext('2d');
      xAxisDOM = selection.append('svg');
      xAxisDOM.attr('class', 'x axis');
      xAxisDOM.attr('id', "x-axis-" + canvasId);
      xAxisDOM.attr('height', Math.floor(context.h() * quandlism_xaxis.h));
      xAxisDOM.attr('width', Math.floor(context.w() - quandlism_yaxis_width));
      xAxisDOM.attr("style", "position: absolute; top: " + (context.h() * quandlism_brush.h) + "px; left: 0px");
      checkDragState = function() {
        if ((line.length()) <= stretchLimit) {
          dateStart = _.first(line.dates());
          dateEnd = _.last(line.dates());
          drawStart = xScale(dateStart);
          drawEnd = xScale(dateEnd);
          return dragEnabled = false;
        } else {
          return dragEnabled = true;
        }
      };
      setScales = function() {
        yScale.domain(context.utility().getExtent(lines, null, null));
        yScale.range([height - context.padding(), context.padding()]);
        xScale.range([context.padding(), width - context.padding()]);
        xScale.domain([_.first(line.dates()), _.last(line.dates())]);
      };
      setBrushValues = function() {
        dateStart = line.dateAt(Math.floor(context.startPoint() * line.length()));
        dateEnd = _.last(line.dates());
        drawStart = xScale(dateStart);
        drawEnd = xScale(dateEnd);
        setPrevious('dateStart', dateStart);
        setPrevious('dateEnd', dateEnd);
        setPrevious('drawStart', drawStart);
        setPrevious('drawEnd', drawEnd);
      };
      update = function() {
        clearCanvas();
        if (useCache) {
          drawFromCache();
        } else {
          draw();
        }
        drawBrush();
      };
      clearCanvas = function() {
        ctx.clearRect(0, 0, getPrevious('width'), getPrevious('height'));
        canvas.attr('width', width).attr('height', height);
      };
      drawAxis = function() {
        var xg;
        xAxisDOM.selectAll('*').remove();
        xg = xAxisDOM.append('g');
        xg.call(xAxis);
        xg.select('path').remove();
      };
      draw = function() {
        var j, _i, _len;
        for (j = _i = 0, _len = lines.length; _i < _len; j = ++_i) {
          line = lines[j];
          line.drawPath(ctx, xScale, yScale, 1);
        }
        if (line.length() <= threshold) {
          line.drawPoints(ctx, xScale, yScale, _.first(line.dates(), _.last(line.dates()), 3));
        }
        saveCanvasData();
      };
      drawFromCache = function() {
        ctx.drawImage(buffer.canvas, 0, 0);
      };
      saveCanvasData = function() {
        useCache = true;
        buffer.setAttribute('width', width);
        buffer.setAttribute('height', height);
        buffer = buffer.getContext('2d');
        buffer.drawImage(document.getElementById(canvasId), 0, 0);
      };
      drawBrush = function() {
        ctx.strokeStyle = 'rgba(237, 237, 237, 0.80)';
        ctx.beginPath();
        ctx.fillStyle = 'rgba(237, 237, 237, 0.80)';
        ctx.fillRect(drawStart, 0, drawEnd - drawStart, height);
        ctx.closePath();
        ctx.beginPath();
        ctx.fillStyle = '#D9D9D9';
        ctx.fillRect(drawStart - handleWidth, 0, handleWidth, height);
        ctx.closePath();
        ctx.beginPath();
        ctx.fillStyle = '#D9D9D9';
        ctx.fillRect(drawEnd, 0, handleWidth, height);
        ctx.closePath();
      };
      removeCache = function() {
        buffer = document.createElement('canvas');
        useCache = false;
      };
      dispatchAdjust = function(calculateDates) {
        var d, endVal, startVal;
        calculateDates = calculateDates != null ? calculateDates : false;
        if (calculateDates) {
          dateStart = xScale.invert(drawStart);
          dateEnd = xScale.invert(drawEnd);
          if (dateStart > dateEnd) {
            d = dateEnd;
            dateEnd = dateStart;
            dateStart = d;
          }
          context.setAttribute('brush', 'start_date', dateStart);
          context.setAttribute('brush', 'end_date', dateEnd);
        }
        startVal = line.getClosestIndex(dateStart);
        endVal = line.getClosestIndex(dateEnd);
        context.adjust(line.dateAt(startVal), startVal, line.dateAt(endVal), endVal);
      };
      saveState = function() {
        var d;
        dragging = false;
        stretching = false;
        activeHandle = 0;
        if (drawStart > drawEnd) {
          d = drawEnd;
          drawEnd = drawStart;
          drawStart = d;
        }
        dateStart = xScale.invert(drawStart);
        dateEnd = xScale.invert(drawEnd);
        setPrevious('drawStart', drawStart);
        setPrevious('dateStart', dateStart);
        setPrevious('drawEnd', drawEnd);
        setPrevious('dateEnd', dateEnd);
      };
      isDraggingLocation = function(x) {
        return x <= drawEnd && x >= drawStart;
      };
      isLeftHandle = function(x) {
        return x >= (drawStart - handleWidth) && x < drawStart;
      };
      isRightHandle = function(x) {
        return x > drawEnd && x <= (drawEnd + handleWidth);
      };
      setBrushClass = function(className) {
        document.getElementById("" + (context.dombrush().substring(1))).className = className;
      };
      setPrevious = function(key, value) {
        previous[key] = value;
      };
      getPrevious = function(key) {
        var _ref;
        return (_ref = previous[key]) != null ? _ref : null;
      };
      setPrevious('width', width);
      setPrevious('height', height);
      setScales();
      checkDragState();
      if (dragEnabled) {
        setBrushValues();
      }
      drawAxis();
      dispatchAdjust(true);
      setInterval(update, 70);
      context.on("respond.brush", function() {
        setPrevious('height', height);
        setPrevious('width', width);
        height = Math.floor(context.h() * quandlism_brush.h);
        width = Math.floor(context.w() - quandlism_yaxis_width);
        removeCache();
        setScales();
        drawStart = xScale(dateStart);
        drawEnd = xScale(dateEnd);
        saveState();
        xAxisDOM.attr('width', width);
        drawAxis();
      });
      context.on('refresh.brush', function() {
        if (_.has(context.options(), 'stage_only') && context.options().stage_only === true) {
          return;
        }
        lines = selection.datum();
        line = _.first(lines);
        removeCache();
        setScales();
        checkDragState();
        if (dragEnabled) {
          setBrushValues();
        }
        drawAxis();
        dispatchAdjust();
      });
      context.on("toggle.brush", function() {
        context.resetState();
        removeCache();
        setScales();
        dispatchAdjust();
      });
      canvas.on('mousedown', function(e) {
        var m;
        d3.event.preventDefault();
        m = d3.mouse(this);
        touchPoint = m[0];
        if (isLeftHandle(m[0])) {
          stretching = true;
          activeHandle = -1;
        } else if (isRightHandle(m[0])) {
          stretching = true;
          activeHandle = 1;
        } else if (isDraggingLocation(m[0])) {
          dragging = true;
        }
      });
      canvas.on('mouseup', function(e) {
        context.resetState();
        dispatchAdjust(true);
        saveState();
      });
      canvas.on('mouseout', function(e) {
        dispatchAdjust(true);
        setBrushClass('');
        saveState();
      });
      canvas.on('mousemove', function(e) {
        var dragDiff, m;
        m = d3.mouse(this);
        if (dragging || stretching) {
          dragDiff = m[0] - touchPoint;
          if (dragging && dragEnabled) {
            drawStart = getPrevious('drawStart') + dragDiff;
            drawEnd = getPrevious('drawEnd') + dragDiff;
          } else if (stretching) {
            if (activeHandle !== 0 && activeHandle !== (-1) && activeHandle !== 1) {
              throw "Error: Unknown stretching direction";
            }
            if (activeHandle === -1) {
              drawStart = getPrevious('drawStart') + dragDiff;
            }
            if (activeHandle === 1) {
              drawEnd = getPrevious('drawEnd') + dragDiff;
            }
          }
          drawStart = drawStart < 0 ? 0 : drawStart;
          drawEnd = drawEnd > width ? width : drawEnd;
        } else if (dragEnabled) {
          if (isDraggingLocation(m[0])) {
            setBrushClass('move');
          } else if (isLeftHandle(m[0]) || isRightHandle(m[0])) {
            setBrushClass('resize');
          } else {
            setBrushClass('');
          }
        }
      });
      return canvas.on("dblclick", function(e) {
        var m;
        d3.event.preventDefault();
        m = d3.mouse(this);
        touchPoint = m[0];
        if (isDraggingLocation(m[0]) || isLeftHandle(m[0]) || isRightHandle(m[0])) {
          dateStart = _.first(line.dates());
          dateEnd = _.last(line.dates());
          drawStart = xScale(dateStart);
          drawEnd = xScale(dateEnd);
          setPrevious('dateStart', dateStart);
          setPrevious('dateEnd', dateEnd);
          setPrevious('drawStart', drawStart);
          setPrevious('drawEnd', drawEnd);
          context.toggle();
        }
      });
    };
    brush.canvasId = function(_) {
      if (_ == null) {
        return canvasId;
      }
      canvasId = _;
      return brush;
    };
    brush.xScale = function(_) {
      if (_ == null) {
        return xScale;
      }
      xScale = _;
      return brush;
    };
    brush.yScale = function(_) {
      if (_ == null) {
        return yScale;
      }
      yScale = _;
      return brush;
    };
    brush.threshold = function(_) {
      if (_ == null) {
        return threshold;
      }
      threshold = _;
      return brush;
    };
    brush.stretchLimit = function(_) {
      if (_ == null) {
        return stretchLimit;
      }
      stretchLimit = _;
      return brush;
    };
    brush.handleWidth = function(_) {
      if (_ == null) {
        return handleWidth;
      }
      handleWidth = _;
      return brush;
    };
    return brush;
  };

  QuandlismContext_.legend = function() {
    var context, legend, lines;
    context = this;
    lines = [];
    legend = function(selection) {
      var buildLegend;
      buildLegend = function() {
        var _this = this;
        lines = selection.datum();
        selection.selectAll('li').remove();
        selection.selectAll('li').data(lines).enter().append('li').attr('style', function(line) {
          return "color: " + (line.color());
        }).attr('class', function(line) {
          if (!line.visible()) {
            return "off";
          }
        }).append('a', ':first-child').attr('href', 'javascript:;').attr('data-line-id', function(line) {
          return line.id();
        }).text(function(line) {
          return line.legendName();
        });
        selection.selectAll('a').on("click", function(d, i) {
          var e, el, id, line;
          e = d3.event;
          el = e.target;
          id = parseInt(el.getAttribute('data-line-id'));
          e.preventDefault();
          line = _.find(lines, function(l) {
            return l.id() === id;
          });
          if (line != null) {
            if (line.toggle() === false) {
              $(el).parent().addClass('off');
            } else {
              $(el).parent().removeClass('off');
            }
            context.toggle();
          }
        });
      };
      buildLegend();
      context.on('refresh.legend', function() {
        buildLegend();
      });
      context.on('toggle.legend', function() {
        buildLegend();
      });
    };
    return legend;
  };

  QuandlismContext_.utility = function() {
    var context, utility,
      _this = this;
    context = this;
    utility = function() {};
    utility.camelize = function(str) {
      return str.replace(/(\_[a-z])/g, function(match) {
        return match.toUpperCase().replace('_', '');
      });
    };
    utility.truncate = function(word, chars) {
      if (word.length > chars) {
        return "" + (word.substring(0, chars)) + "...";
      } else {
        return word;
      }
    };
    utility.buildLines = function(attributes) {
      var keys, lineData, lines;
      keys = attributes.columns.slice(1);
      lineData = _.map(keys, function(key, i) {
        return utility.getLineData(attributes.data, i);
      });
      lines = _.map(keys, function(key, i) {
        return context.line({
          name: key,
          values: lineData[i]
        });
      });
      return lines;
    };
    utility.processLines = function(attributes, lines) {
      var i, line, _i, _len;
      context.addColorsIfNecessary(lines);
      for (i = _i = 0, _len = lines.length; _i < _len; i = ++_i) {
        line = lines[i];
        line.color(context.colorList()[i]);
        if ((attributes.show != null) && attributes.show.length) {
          line.visible((__indexOf.call(attributes.show, i) >= 0));
        }
      }
      return lines;
    };
    utility.getLineData = function(data, index) {
      var formatter;
      formatter = d3.time.format("%Y-%m-%d");
      return _.map(data, function(d) {
        return {
          date: formatter.parse(d[0]),
          num: d[index + 1]
        };
      });
    };
    utility.mergeLines = function(attributes, lines) {
      var line, _i, _len;
      lines = utility.addNewLinesAndRefresh(lines, attributes);
      lines = utility.removeStaleLines(lines, attributes.columns);
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        line.setup();
      }
      return lines;
    };
    utility.addNewLinesAndRefresh = function(lines, attributes) {
      var column, columnIndex, found, i, line, lineData, _i, _j, _len, _len1, _ref;
      _ref = attributes.columns.slice(1);
      for (columnIndex = _i = 0, _len = _ref.length; _i < _len; columnIndex = ++_i) {
        column = _ref[columnIndex];
        found = false;
        lineData = utility.getLineData(attributes.data, columnIndex);
        for (i = _j = 0, _len1 = lines.length; _j < _len1; i = ++_j) {
          line = lines[i];
          if (line.name() === column) {
            found = true;
            lines[i].values(lineData.reverse());
            break;
          }
        }
        if (!found) {
          line = context.line({
            name: column,
            values: lineData
          });
          lines.push(line);
        }
      }
      return lines;
    };
    utility.removeStaleLines = function(lines, columns) {
      return _.reject(lines, function(line) {
        var _ref;
        return _ref = line.name(), __indexOf.call(columns, _ref) < 0;
      });
    };
    utility.getMultiExtent = function(lines, start, end) {
      var exesMax, exesMin, groupedExtents;
      if (!utility.shouldShowDualAxis(lines, start, end)) {
        return [utility.getExtent(lines, start, end)];
      }
      groupedExtents = utility.getGroupMinMaxList(lines, min, max, start, end);
      exesMin = _.first(groupedExtents);
      exesMax = _.last(groupedExtents);
      return [
        [
          d3.min(exesMin, function(m) {
            return m[0];
          }), d3.max(exesMin, function(m) {
            return m[1];
          })
        ], [
          d3.min(exesMax, function(m) {
            return m[0];
          }), d3.max(exesMax, function(m) {
            return m[1];
          })
        ]
      ];
    };
    utility.getExtent = function(lines, start, end) {
      var exes, line;
      exes = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = lines.length; _i < _len; _i++) {
          line = lines[_i];
          _results.push(line.extent(start, end));
        }
        return _results;
      })();
      return [
        d3.min(exes, function(m) {
          return m[0];
        }), d3.max(exes, function(m) {
          return m[1];
        })
      ];
    };
    utility.getMultiExtent = function(lines, start, end) {
      var exes_max, exes_min, line, max, min, val, _i, _len;
      min = Infinity;
      max = -Infinity;
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        val = line.extent(start, end)[1];
        if (val === Infinity || val === -Infinity) {
          continue;
        }
        if (val < min) {
          min = val;
        }
        if (val > max) {
          max = val;
        }
      }
      exes_min = utility.getGroupMinMaxList(lines, min, max, start, end)[0];
      exes_max = utility.getGroupMinMaxList(lines, min, max, start, end)[1];
      return [
        [
          d3.min(exes_min, function(m) {
            return m[0];
          }), d3.max(exes_min, function(m) {
            return m[1];
          })
        ], [
          d3.min(exes_max, function(m) {
            return m[0];
          }), d3.max(exes_max, function(m) {
            return m[1];
          })
        ]
      ];
    };
    utility.getGroupMinMaxList = function(lines, min, max, start, end) {
      var line, max_dis, min_dis, _i, _len, _resultsMax, _resultsMin;
      _resultsMin = [];
      _resultsMax = [];
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        min_dis = Math.abs(min - _.last(line.extent(start, end)));
        max_dis = Math.abs(max - _.last(line.extent(start, end)));
        if (min_dis < max_dis || min_dis === 0) {
          _resultsMin.push(line.extent(start, end));
        }
        if (min_dis > max_dis || max_dis === 0) {
          _resultsMax.push(line.extent(start, end));
        }
      }
      return [_resultsMin, _resultsMax];
    };
    utility.getExtentFromDates = function(lines, startDate, endDate) {
      var exes, line;
      exes = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = lines.length; _i < _len; _i++) {
          line = lines[_i];
          _results.push(line.extentByDate(startDate, endDate));
        }
        return _results;
      })();
      return [
        d3.min(exes, function(m) {
          return m[0];
        }), d3.max(exes, function(m) {
          return m[1];
        })
      ];
    };
    utility.getMonthName = function(monthDigit) {
      var months;
      months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months[monthDigit];
    };
    utility.getColor = function(i) {
      return context.colorList()[i];
    };
    utility.formatNumberAsString = function(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    utility.getPixelRGB = function(m, ctx) {
      var px, rgb;
      px = ctx.getImageData(m[0], m[1], 1, 1).data;
      rgb = d3.rgb(px[0], px[1], px[2]);
      return rgb.toString();
    };
    utility.getUnitAndDivisor = function(extent) {
      var len;
      len = extent.toString().length;
      if (len <= 4) {
        return {
          label: '',
          divisor: 1
        };
      } else if (len < 7) {
        return {
          label: 'k',
          divisor: 1000
        };
      } else if (len <= 9) {
        return {
          label: 'M',
          divisor: 1000000
        };
      } else {
        return {
          label: 'B',
          divisor: 1000000000
        };
      }
    };
    utility.getDateKey = function(date) {
      if (date == null) {
        return null;
      }
      return date.valueOf();
    };
    utility.stageHeight = function() {
      if (context.dombrush() != null) {
        return quandlism_stage.h * context.h();
      } else {
        return context.h() * 0.90;
      }
    };
    utility.xAxisHeight = function() {
      if (context.dombrush() != null) {
        return quandlism_xaxis.h * context.h();
      } else {
        return context.h() * 0.10;
      }
    };
    utility.visibleColumns = function(lines) {
      var i, line, vis, _i, _len;
      vis = [];
      for (i = _i = 0, _len = lines.length; _i < _len; i = ++_i) {
        line = lines[i];
        if (line.visible()) {
          vis.push(i);
        }
      }
      return vis;
    };
    utility.shouldShowDualAxes = function(start, end) {
      var distance, exe1, exe2, kDISTANCE_RULE, kSIZE_RULE, last_line, line, lines, linesAll, max1, max2, min1, min2, normalized, ratio, rest, size1, size2, _i, _j, _len, _len1;
      kSIZE_RULE = 0.1;
      kDISTANCE_RULE = 0.6;
      linesAll = context.lines();
      if (!((linesAll != null) && linesAll instanceof Array)) {
        return false;
      }
      if (linesAll.length === 1 || utility.visibleColumns(linesAll).length < 2) {
        return false;
      }
      lines = [];
      for (_i = 0, _len = linesAll.length; _i < _len; _i++) {
        line = linesAll[_i];
        if (line.visible()) {
          lines.push(line);
        }
      }
      normalized = true;
      for (_j = 0, _len1 = lines.length; _j < _len1; _j++) {
        line = lines[_j];
        if (line.firstValue() !== 100) {
          normalized = false;
        }
      }
      if (normalized) {
        return false;
      }
      last_line = lines.slice(lines.length - 1, lines.length);
      rest = lines.slice(0, lines.length - 1);
      exe1 = utility.getExtent(rest, start, end);
      min1 = parseFloat(_.first(exe1));
      max1 = parseFloat(_.last(exe1));
      size1 = max1 - min1;
      exe2 = utility.getExtent(last_line, start, end);
      min2 = parseFloat(_.first(exe2));
      max2 = parseFloat(_.last(exe2));
      size2 = max2 - min2;
      ratio = size1 / size2;
      if (ratio > 1) {
        ratio = 1 / ratio;
      }
      if (ratio < kSIZE_RULE) {
        return true;
      }
      if (max1 > max2) {
        if (max2 > min1) {
          return false;
        }
      } else {
        if (max1 > min2) {
          return false;
        }
      }
      distance = 0;
      if (max1 > max2) {
        distance = min1 - max2;
      } else {
        distance = min2 - max1;
      }
      if (distance / size1 > kDISTANCE_RULE || distance / size2 > kDISTANCE_RULE) {
        return true;
      }
      return false;
    };
    return utility;
  };

}).call(this);

 })(this);