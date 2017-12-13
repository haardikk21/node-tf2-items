module.exports = Schema;

var WebRequest = require('./WebRequest.js');

function Schema(options) {}

Schema.prototype.fetch = function(apiKey, language, callback) {
	if (typeof language === 'function') {
		callback = language;
		language = "English";
	}

	var self = this;
	new WebRequest("GET", "GetSchema", "v0001", { language: language, key: apiKey }, function(err, body) {
		if (err) {
			callback(err);
			return;
		}

		var result = body.result;

		self.status = result.status;
		if (self.status == 1) {
			self.qualities = {};
			// Get all qualities with their 'proper' name and id paired.
			for (var quality in result.qualities) {
				var id = result.qualities[quality];
				var name = result.qualityNames[quality];
				self.qualities[name] = id;
			}
			self.items = result.items;
			this.effects = result.attribute_controlled_attached_particles;
			this.attributes = result.attributes;
		}

		callback(null, self.status == 1);
	});
};

Schema.prototype.getItem = function(defindex) {
	for (var i = 0; i < this.items.length; i++) {
		var item = this.items[i];
		if (item.defindex == defindex) {
			return {
				name: item.item_name,
				proper_name: item.proper_name || false,
				image: item.image_url_large.replace('http://media.steampowered.com/apps/440/icons/', '')
			};
		}
	}
	return null;
};

Schema.prototype.getItems = function(defindex) {
	return this.items || null;
};

Schema.prototype.getQuality = function(search) {
	// Check if we are searching with a name or id and return the opposite if found.
	var isID = isNaN(parseInt(search)) === false;
	if (isID) {
		for (var quality in this.qualities) {
			if (this.qualities[quality] == search) {
				return quality;
			}
		}
	} else {
		if (this.qualities.hasOwnProperty(search)) {
			return this.qualities[search];
		}
	}

	return null;
};

Schema.prototype.getEffectWithId = function(id) {
	for (var i = 0; i < this.effects.length; i++) {
		if (this.effects[i].id == id) {
			return this.effects[i];
		}
	}
	return null;
};