QuandlismContext_.axis = function() {
  var context = this,
  scale = d3.time.scale().domain([0, length]).range([0, context.width()]),
  axis_ = d3.svg.axis().scale(scale),
  active = false,
  data,
  id;
  
  function axis(selection) {
    id = selection.attr('id');      
    data = selection.datum();
    
    extent = [d3.first(data), d3.last(data)];
    
    parseDate = context.utility().parseDate();
        
    scale.domain([parseDate(extent[0]), parseDate(extent[1])]);
   
    axis_.tickFormat(d3.time.format('%b %d, %Y'));
   
    axis_.ticks(Math.floor(context.width() / 150), 0, 0);
    scale.range([0, context.width()]);
    
    function update() {
      var g = selection.append('svg')
          .attr('width', context.width())
          .attr('height', 100)
        .append('g')
          .attr('transform', 'translate(0,27)')
          .call(axis_);
    }
    
    update();
    
    // Listen for resize
    context.on('respond.axis-'+id, function() {
    
      axis.remove();
    
      axis_.ticks(Math.floor(context.width() / 150), 0, 0);
    
      scale.range([0, context.width()]);
      update();
    });
    
    // If the axis is active, it should respond to the brush event to update its access
    if (active) {
      
      context.on('adjust.axis-'+id, function(x1, x2) {
        console.log(x1, x2);
      });
    }
    

    
  
        

        
  }
  
  axis.remove = function() {
    d3.select('#' + id).selectAll("svg").remove();
  }
  
  axis.active = function(_) {
    if (!arguments.length) {
      return active;
    }
    active = _;
    return axis;
  }
  
  return d3.rebind(axis, axis_, 'orient', 'ticks', 'ticksSubdivide', 'tickSize', 'tickPadding', 'tickFormat');
}