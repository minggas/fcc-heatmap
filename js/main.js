const end =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const margin = {
  top: 80,
  right: 30,
  bottom: 80,
  left: 90
};
let w = 1520 - margin.left - margin.right,
  h = 630 - margin.top - margin.bottom;

function monthParse(month) {
  const date = new Date(0);
  date.setUTCMonth(month);
  return d3.timeFormat("%B")(date);
}

//Tooltip
let tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);
//Chart container
let svgContainer = d3
  .select("body")
  .append("svg")
  .attr("class", "chart")
  .attr("width", w + margin.left + margin.right)
  .attr("height", h + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Fetch the data
d3.json(end)
  .then(data => {
    const baseTemp = data.baseTemperature;
    const heatData = data.monthlyVariance;
    const minTemp = data.baseTemperature + d3.min(heatData, d => d.variance);
    const maxTemp = data.baseTemperature + d3.max(heatData, d => d.variance);

    //Color function
    const legendColor = d3
      .scaleThreshold()
      .domain(
        ((min, max, count) => {
          let array = [];
          let step = (max - min) / count;
          let base = min;
          for (let i = 1; i < count; i++) {
            array.push(base + i * step);
          }
          return array;
        })(minTemp, maxTemp, 12)
      )
      .range(d3.schemeRdYlBu[11].reverse());

    //Scale the chart with the data
    let xScale = d3
      .scaleLinear()
      .domain([d3.min(heatData, d => d.year), d3.max(heatData, d => d.year)])
      .range([0, w]);

    let yScale = d3
      .scaleBand()
      .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
      .rangeRound([0, h]);

    //Make the Axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale).tickFormat(d => monthParse(d));

    //Put the X axis on the chart
    svgContainer
      .append("g")
      .attr("class", "x axis")
      .attr("id", "x-axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis)
      .append("text")
      .text("Year")
      .attr("class", "x-axis-label")
      .attr("x", w / 2)
      .attr("y", 10)
      .style("text-anchor", "end");

    //Put the Y axis on the chart
    svgContainer
      .append("g")
      .attr("class", "y axis")
      .attr("id", "y-axis")
      .call(yAxis);

    //Put the chart on the DOM
    svgContainer
      .append("g")
      .attr("class", "map")
      .attr("transform", "translate(2,0)")
      .selectAll("rect")
      .data(heatData)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("data-month", d => d.month)
      .attr("data-temp", d => d.variance)
      .attr("data-year", d => d.year)
      .attr("x", d => xScale(d.year))
      .attr("y", d => yScale(d.month))
      .attr("width", w / 262)
      .attr("height", h / 12)
      .style("fill", d => legendColor(baseTemp + d.variance))
      //Make the tooltip show data with the mouse over
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);
    //Add Title and Subtitle
    svgContainer
      .append("text")
      .attr("id", "title")
      .attr("x", w / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "2rem")
      .text("Monthly Global Land-Surface Temperature");

    svgContainer
      .append("text")
      .attr("x", w / 2)
      .attr("y", -margin.top / 2 + 25)
      .attr("id", "description")
      .attr("text-anchor", "middle")
      .style("font-size", "1rem")
      .text(
        `${d3.min(heatData, d => d.year)} - ${d3.max(
          heatData,
          d => d.year
        )}: base temperature ${baseTemp}℃`
      );

    //Add the Legend to the Chart

    var legendX = d3
      .scaleQuantile()
      .domain(
        ((min, max, count) => {
          let array = [];
          let step = (max - min) / count;
          let base = min;
          for (let i = 1; i < count; i++) {
            array.push(base + i * step);
          }
          return array;
        })(minTemp, maxTemp, 11)
      )
      .range([0, 30, 60, 90, 120, 150, 180, 210, 240, 270]);

    var legendXAxis = d3
      .axisBottom(legendX)
      .ticks(10)
      .tickFormat(d3.format(".1f"));

    let legend = svgContainer
      .append("g")
      .attr("id", "legend")
      .attr("transform", "translate(" + 5 + "," + 500 + ")");

    legend
      .selectAll("rect")
      .data(legendColor.domain())
      .enter()
      .append("rect")
      .attr("x", (d, i) => 0 + i * 30)
      .attr("width", 30)
      .attr("height", 30)
      .style("fill", (d, i) => d3.schemeRdYlBu[11][i])
      .style("stroke", "black");

    legend
      .append("g")
      .attr("class", "y axis")
      .attr("id", "y-axis")
      .attr("padding", 30)
      .call(legendXAxis);
  })
  .catch(err => {
    alert(err);
  });

function handleMouseOver(d, i) {
  console.log(d.month);
  tooltip
    .transition()
    .duration(200)
    .style("opacity", 0.8);
  tooltip
    .html(
      `${monthParse(d.month)} - ${d.year}<br/>${(8.66 + d.variance).toFixed(
        2
      )}℃<br/>${d.variance}`
    )
    .attr("data-year", d.year)
    .style("left", d3.event.pageX + 15 + "px")
    .style("top", d3.event.pageY - 5 + "px");
}

function handleMouseOut(d) {
  tooltip
    .transition()
    .duration(200)
    .style("opacity", 0);
}
