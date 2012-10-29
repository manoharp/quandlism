QuandlismContext_.stage = function() {
  var context = this,
  lines = [],
  width = context.width(), height = context.height(),
  stageHeight = height * 0.9,
  xScale = d3.scale.linear(),
  yScale = d3.scale.linear(),
  extent = null,
  canvas = null,
  ctx = null,
  start = 0, end = 0,
  format = d3.format('.2s'),
  colors = ["#08519c","#3182bd","#6baed6","#bdd7e7","#bae4b3","#74c476","#31a354","#006d2c"];
  
  
  function stage(selection) {
    
    var self = this;
    lines = selection.datum();
    selection.append('canvas').attr('width', width).attr('height', stageHeight).attr('class', 'stage');
    canvas = selection.select('.stage');
    ctx = canvas.node().getContext('2d');
    
    
    end = lines[0].length();
    start = Math.floor(lines[0].length()*.80);
    

    draw();
    
    function draw() {
      
      exes = _.map(lines, function(line, j) {
        return line.extent(start, end);
      });  
      extent = [d3.min(exes, function(m) { return m[0]; }), d3.max(exes, function(m) { return m[1]; })]
    
      
      yScale.domain([extent[0], extent[1]]); 
      yScale.range([stageHeight, 0 ]);
    
      xScale.domain([start, end]);
      xScale.range([0, width]);
      
      ctx.clearRect(0, 0, width, height);
      
      _.each(lines, function(line, j) {
        context.utility().drawPath(line, colors[j], ctx, xScale, yScale, start, end);
      });
      
    }
    
    
    context.on('respond.stage', function() {
      
      ctx.clearRect(0, 0, width, stageHeight);
      
      width = context.width(), height = context.height(), stageHeight = height * 0.9;
      
      canvas.attr('width', width).attr('height', stageHeight);
            
      draw();

    });
    
    context.on('adjust.stage', function(x1, x2) {
      start = (x1 > 0) ? x1 : 0;
      end = (x2 < lines[0].length()) ? x2 : lines[0].length() -1;
      draw();
    });

      
  }

  
  stage.lines = function(_) {
    if (!arguments.length) {
      return lines;
    }
    lines = _;
    return stage;
  }
  
  return stage;
}