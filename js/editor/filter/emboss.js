(function(Daisy, $) {
	
	// filter strength
	var _strength = 2;

	// shifting matrix
	var matrix = [-2, -1, 0, -1, 1, 1, 0, 1, 2];

	// normalize matrix
	(function normalizeMatrix(m) {
		var j = 0;
		for(var i = 0; i < m.length; i++) {
			j += m[i];
		}
		for(var i = 0; i < m.length; i++) {
			m[i] /= j;
		}
	})(matrix);

	// process emboss function
	$.processEmboss = function(ctx,left,top,width,height,strength) {
		
		if(strength==null)
			strength = _strength;
		
		//$.log("es:%d",strength)
		var imageData = ctx.getImageData(left,top,width,height),
			buffImageData = ctx.getImageData(left, top, width, height),
			data = imageData.data,
			bufferedData = buffImageData.data;
	
		for(var i = 1; i < width - 1; i++) {
			for(var j = 1; j < height - 1; j++) {

				var sumR = sumG = sumB = 0;

				// loop through the matrix
				for(var h = 0; h < 3; h++) {
					for(var w = 0; w < 3; w++) {
						var _x = i+h-1,_y = j+w-1, r=(_x+_y*width)<< 2;
						var _r = bufferedData[r],_g = bufferedData[r+1],_b=bufferedData[r+2];
						
						sumR += _r * matrix[w + h * 3];
						sumG += _g * matrix[w + h * 3];
						sumB += _b * matrix[w + h * 3];
					}
				}

				var rf = (i+j*width) << 2;
				data[rf] = strength * sumR + (1 - strength) * data[rf];  
				data[rf + 1] = strength * sumG + (1 - strength) * data[rf+1];  
				data[rf + 2] = strength * sumB + (1 - strength) * data[rf+2];  
			}
		}
	
		ctx.putImageData(imageData, left, top);
	}
})(Daisy, Daisy.$);
