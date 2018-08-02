"use strict";

var container = document.querySelector(".container");
console.dir(container);

var w = container.clientWidth - 130,
    h = container.clientHeight - 155;

//Mouse over element
var overlay = d3.select(".container").append("div").attr("class", "overlay").style("opacity", 0);
//Tooltip with data information
var tooltip = d3.select(".container").append("div").attr("id", "tooltip").style("opacity", 0);
//Chart container
var svgContainer = d3.select(".container").append("svg").attr("class", "chart").attr("width", w + 100).attr("height", h + 90);

//Fetch the data
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json").then(function (data) {
  var yLabel = data.name.split(",")[0];
  var dates = data.data.map(function (date) {
    return date[0];
  });
  var values = data.data.map(function (val) {
    return val[1];
  });
  var dataLength = data.data.length;
  var minDate = new Date(d3.min(dates));
  var maxDate = new Date(d3.max(dates));
  var minValue = d3.min(values);
  var maxValue = d3.max(values);
  var barWidth = w / dataLength;

  //Y Axis Label
  var yText = svgContainer.append("text").attr("class", "y-label").attr("transform", "rotate(-90)").attr("x", function (d, j) {
    return h / 5 - h;
  }).attr("y", 80).text(yLabel);
  //X Label informations
  var xText = svgContainer.append("text").attr("class", "x-label").attr("x", 0).attr("y", h + 60).text(data.description.split("\n")[2].split("-")[0]);
  svgContainer.append("text").attr("class", "x-label").attr("x", w).attr("y", h + 80).text(data.description.split("\n")[2].split("-")[1]);
  //Scale the chart with the time data
  var xScale = d3.scaleTime().domain([minDate, maxDate]).range([0, w]);

  var xAxis = d3.axisBottom().scale(xScale);
  //Put the X axis on the chart
  var xAxisGroup = svgContainer.append("g").call(xAxis).attr("id", "x-axis").attr("transform", "translate(60," + h + ")");
  //Scale the chart with the values data
  var yScale = d3.scaleLinear().domain([minValue, maxValue]).range([minValue / maxValue * h, h]);

  var scaledValues = values.map(function (item) {
    return yScale(item);
  });
  //Create the Y axis scale
  var yAxisScale = d3.scaleLinear().domain([minValue, maxValue]).range([h, minValue / maxValue * h]);

  var yAxis = d3.axisLeft(yAxisScale);
  //Put the Y axis on the chart
  var yAxisGroup = svgContainer.append("g").call(yAxis).attr("id", "y-axis").attr("transform", "translate(60, 0)");
  //Put the chart on the DOM
  d3.select("svg").selectAll("rect").data(scaledValues).enter().append("rect").attr("data-date", function (d, i) {
    return dates[i];
  }).attr("data-gdp", function (d, i) {
    return values[i];
  }).attr("class", "bar").attr("x", function (d, i) {
    return i * barWidth;
  }).attr("y", function (d) {
    return h - d;
  }).attr("width", barWidth).attr("height", function (d) {
    return d;
  }).style("fill", "hsla(105, 30%, 50%, 0.5)").attr("transform", "translate(60, 0)")
  //Make the tooltip appear and highligth the bar with the mouse over
  .on("mouseover", function (d, i) {
    overlay.transition().duration(0).style("background-color", "hsla(105, 30%, 50%, 0.9)").style("height", d + "px").style("width", barWidth + "px").style("opacity", 0.9).style("left", i * barWidth + "px").style("top", h - d + "px").style("transform", "translateX(60px)");
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip.html(new Date(dates[i]).toLocaleDateString("en", {
      year: "numeric",
      month: "long"
    }) + "<br>" + "$" + values[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, "$1,") + " Billion").attr("data-date", dates[i]).style("left", i * barWidth - 40 + "px").style("top", h - d - 55 + "px").style("transform", "translateX(60px)");
  }).on("mouseout", function (d) {
    overlay.transition().duration(200).style("opacity", 0);
    tooltip.transition().duration(200).style("opacity", 0);
  });
}).catch(function (err) {
  alert(err);
});
