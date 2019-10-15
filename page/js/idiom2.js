(function () {
  svg = d3.select('#idiom2-center').append('svg')

  // Definimos márgenes
  const MARGIN = { TOP: 30, BOTTOM: 30, LEFT: 20, RIGHT: 20 };

  // Definimos dimensiones del svg
  const HEIGHT = 1000
  const WIDTH = 1000

  // Definimos dimensiones del svg considerando margenes
  const widthSVG = WIDTH - MARGIN.RIGHT - MARGIN.LEFT;
  const heighSVG = HEIGHT - MARGIN.TOP - MARGIN.BOTTOM;

  let i = 0;

  var orientation = {
    size: [widthSVG, heighSVG],
    x: d => d.x,
    y: d => d.y
  };

  const create_tree = (dataset) => {
    const containerTree = svg
      .attr('width', WIDTH)
      .attr('height', HEIGHT)
      .append('g')
      .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);
      
    tree = d3.tree().size(orientation.size);
    data = tree(d3.hierarchy(dataset));

    const nodes = data.descendants();
    const links = data.links();

    // Creamos cada link
    containerTree
      .selectAll('.link')
      .data(links)
      .enter()
      .append('path')
      .attr('class', d => {
        return 'link id-' + d.source.data.id + '-' + d.target.data.id;
      })
      .attr('d', d => {
        return (
          'M' +
          d.target.x +
          ',' +
          orientation.y(d.target) +
          'C' +
          d.target.x +
          ',' +
          (orientation.y(d.target) + orientation.y(d.source)) / 2 +
          ' ' +
          d.source.x +
          ',' +
          (orientation.y(d.target) + orientation.y(d.source)) / 2 +
          ' ' +
          d.source.x +
          ',' +
          orientation.y(d.source)
        );
      })
      .style('opacity', 0)
      .style('fill', 'none')
      .style('stroke', 'gray')
      .transition()
      .duration(800)
      .style('opacity', 1)

    // Creamos cada nodo
    var node = containerTree
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('circle');

    node.attr('class', d => {
      node_class = `node id-${i}`
      d.id = i
      i += 1
      return node_class
    })
      .attr('r', 0)
      .attr('cx', orientation.x)
      .attr('cy', orientation.y)
      .style('fill', '#ef5350')
      .transition()
      .duration(600)
      .attr('r', 5);
  }


  const main = async () => {
    dataset = await d3.json('https://raw.githubusercontent.com/fjlopez7/proyecto_info_vis/master/data/trees/decision_tree.json')
    create_tree(dataset)
  }

  main()
})()
