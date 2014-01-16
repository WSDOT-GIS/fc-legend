(function () {
	"use strict";

	/** @constructor - Represents an item in the legend.
	 * 
	*/
	function LegendItem(data) {
		this.contentType = data.contentType;
		this.imageData = data.imageData;
		this.label = data.label;
		this.url = data.url;
		this.dataUri = ["data:", this.contentType, ";base64,", this.imageData].join("");
	}

	/** @constructor - Represents a layer in the legend. 
	*/
	function Layer(data) {
		this.layerId = data.layerId;
		this.layerName = data.layerName;
		this.layerType = data.layerType;
		this.legend = data.legend;
		this.maxScale = data.maxScale;
		this.minScale = data.minScale;
	}

	/** Used to parse JSON into specific classes. */
	function legendResponseReviver(k, v) {
		if (v.imageData) {
			return new LegendItem(v);
		} else if (v.legend) {
			return new Layer(v);
		} else {
			return v;
		}
	}

	function handleResponse(/**{XMLHttpRequestProgressEvent}*/ e) {
		var data = JSON.parse(e.target.responseText, legendResponseReviver);
		var layers = data.layers;
		var table;

		/**
		 * @this {Object} - Has table and layer properties.
		*/
		var createLegendRow = function (legend) {
			var row = table.insertRow(-1);
			var cell = row.insertCell(-1);
			var img = document.createElement("img");
			img.src = legend.dataUri;
			cell.appendChild(img);
			cell = row.insertCell(-1);
			cell.textContent = this.prefix ? [this.prefix, legend.label].join(" ") : legend.label;
		};

		function createLayerTable(layer) {

			layer.legend.forEach(createLegendRow, {
				table: table,
				layer: layer,
				prefix: /Proposed/i.test(layer.layerName) ? "Proposed" : null
			});
			document.body.appendChild(table);
		}

		table = document.createElement("table");
		layers.filter(function (layer) {
			return !layer.minScale && !layer.maxScale;
		}).forEach(createLayerTable);

	}

	var request = new XMLHttpRequest();
	request.onload = handleResponse;

	request.open("get", "./legend-data.txt");
	request.send();
}());