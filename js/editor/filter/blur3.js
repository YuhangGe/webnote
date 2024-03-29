
(function(Daisy, $) {
	var mul_table = [1, 171, 205, 293, 57, 373, 79, 137, 241, 27, 391, 357, 41, 19, 283, 265, 497, 469, 443, 421, 25, 191, 365, 349, 335, 161, 155, 149, 9, 278, 269, 261, 505, 245, 475, 231, 449, 437, 213, 415, 405, 395, 193, 377, 369, 361, 353, 345, 169, 331, 325, 319, 313, 307, 301, 37, 145, 285, 281, 69, 271, 267, 263, 259, 509, 501, 493, 243, 479, 118, 465, 459, 113, 446, 55, 435, 429, 423, 209, 413, 51, 403, 199, 393, 97, 3, 379, 375, 371, 367, 363, 359, 355, 351, 347, 43, 85, 337, 333, 165, 327, 323, 5, 317, 157, 311, 77, 305, 303, 75, 297, 294, 73, 289, 287, 71, 141, 279, 277, 275, 68, 135, 67, 133, 33, 262, 260, 129, 511, 507, 503, 499, 495, 491, 61, 121, 481, 477, 237, 235, 467, 232, 115, 457, 227, 451, 7, 445, 221, 439, 218, 433, 215, 427, 425, 211, 419, 417, 207, 411, 409, 203, 202, 401, 399, 396, 197, 49, 389, 387, 385, 383, 95, 189, 47, 187, 93, 185, 23, 183, 91, 181, 45, 179, 89, 177, 11, 175, 87, 173, 345, 343, 341, 339, 337, 21, 167, 83, 331, 329, 327, 163, 81, 323, 321, 319, 159, 79, 315, 313, 39, 155, 309, 307, 153, 305, 303, 151, 75, 299, 149, 37, 295, 147, 73, 291, 145, 289, 287, 143, 285, 71, 141, 281, 35, 279, 139, 69, 275, 137, 273, 17, 271, 135, 269, 267, 133, 265, 33, 263, 131, 261, 130, 259, 129, 257, 1];

	var shg_table = [0, 9, 10, 11, 9, 12, 10, 11, 12, 9, 13, 13, 10, 9, 13, 13, 14, 14, 14, 14, 10, 13, 14, 14, 14, 13, 13, 13, 9, 14, 14, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 12, 14, 15, 15, 13, 15, 15, 15, 15, 16, 16, 16, 15, 16, 14, 16, 16, 14, 16, 13, 16, 16, 16, 15, 16, 13, 16, 15, 16, 14, 9, 16, 16, 16, 16, 16, 16, 16, 16, 16, 13, 14, 16, 16, 15, 16, 16, 10, 16, 15, 16, 14, 16, 16, 14, 16, 16, 14, 16, 16, 14, 15, 16, 16, 16, 14, 15, 14, 15, 13, 16, 16, 15, 17, 17, 17, 17, 17, 17, 14, 15, 17, 17, 16, 16, 17, 16, 15, 17, 16, 17, 11, 17, 16, 17, 16, 17, 16, 17, 17, 16, 17, 17, 16, 17, 17, 16, 16, 17, 17, 17, 16, 14, 17, 17, 17, 17, 15, 16, 14, 16, 15, 16, 13, 16, 15, 16, 14, 16, 15, 16, 12, 16, 15, 16, 17, 17, 17, 17, 17, 13, 16, 15, 17, 17, 17, 16, 15, 17, 17, 17, 16, 15, 17, 17, 14, 16, 17, 17, 16, 17, 17, 16, 15, 17, 16, 14, 17, 16, 15, 17, 16, 17, 17, 16, 17, 15, 16, 17, 14, 17, 16, 15, 17, 16, 17, 13, 17, 16, 17, 17, 16, 17, 14, 17, 16, 17, 16, 17, 16, 17, 9];


	$.stackBoxBlurCanvasRGBA = function(ctx, top_x, top_y, width, height, radius, iterations) {
		radius = (radius==null?5:radius);

		if(isNaN(iterations))
			iterations = 1;
		iterations |= 0;
		if(iterations > 3)
			iterations = 3;
		if(iterations < 1)
			iterations = 1;

		var imageData = ctx.getImageData(top_x, top_y, width, height);

		var pixels = imageData.data;

		var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum, r_out_sum, g_out_sum, b_out_sum, a_out_sum, r_in_sum, g_in_sum, b_in_sum, a_in_sum, pr, pg, pb, pa, rbs;

		var div = radius + radius + 1;
		var w4 = width << 2;
		var widthMinus1 = width - 1;
		var heightMinus1 = height - 1;
		var radiusPlus1 = radius + 1;

		var stackStart = {
			r : 0,
			g : 0,
			b : 0,
			a : 0,
			next : null
		};

		var stack = stackStart;
		for( i = 1; i < div; i++) {
			stack = stack.next = {
				r : 0,
				g : 0,
				b : 0,
				a : 0,
				next : null
			};
		}
		stack.next = stackStart;
		var stackIn = null;

		var mul_sum = mul_table[radius];
		var shg_sum = shg_table[radius];
		while(iterations-- > 0) {
			yw = yi = 0;
			for( y = height; --y > -1; ) {
				r_sum = radiusPlus1 * ( pr = pixels[yi] );
				g_sum = radiusPlus1 * ( pg = pixels[yi + 1] );
				b_sum = radiusPlus1 * ( pb = pixels[yi + 2] );
				a_sum = radiusPlus1 * ( pa = pixels[yi + 3] );
				stack = stackStart;

				for( i = radiusPlus1; --i > -1; ) {
					stack.r = pr;
					stack.g = pg;
					stack.b = pb;
					stack.a = pa;
					stack = stack.next;
				}

				for( i = 1; i < radiusPlus1; i++) {
					p = yi + ((widthMinus1 < i ? widthMinus1 : i ) << 2 );
					r_sum += (stack.r = pixels[p]);
					g_sum += (stack.g = pixels[p + 1]);
					b_sum += (stack.b = pixels[p + 2]);
					a_sum += (stack.a = pixels[p + 3]);
					stack = stack.next;
				}
				stackIn = stackStart;
				for( x = 0; x < width; x++) {
					pixels[yi++] = (r_sum * mul_sum) >>> shg_sum;
					pixels[yi++] = (g_sum * mul_sum) >>> shg_sum;
					pixels[yi++] = (b_sum * mul_sum) >>> shg_sum;
					pixels[yi++] = (a_sum * mul_sum) >>> shg_sum;
					p = (yw + (( p = x + radius + 1 ) < widthMinus1 ? p : widthMinus1 ) ) << 2;
					r_sum -= stackIn.r - (stackIn.r = pixels[p]);
					g_sum -= stackIn.g - (stackIn.g = pixels[p + 1]);
					b_sum -= stackIn.b - (stackIn.b = pixels[p + 2]);
					a_sum -= stackIn.a - (stackIn.a = pixels[p + 3]);
					stackIn = stackIn.next;

				}
				yw += width;
			}

			for( x = 0; x < width; x++) {
				yi = x << 2;
				r_sum = radiusPlus1 * ( pr = pixels[yi]);
				g_sum = radiusPlus1 * ( pg = pixels[yi + 1]);
				b_sum = radiusPlus1 * ( pb = pixels[yi + 2]);
				a_sum = radiusPlus1 * ( pa = pixels[yi + 3]);
				stack = stackStart;

				for( i = 0; i < radiusPlus1; i++) {
					stack.r = pr;
					stack.g = pg;
					stack.b = pb;
					stack.a = pa;
					stack = stack.next;
				}
				yp = width;

				for( i = 1; i <= radius; i++) {
					yi = (yp + x ) << 2;
					r_sum += (stack.r = pixels[yi]);
					g_sum += (stack.g = pixels[yi + 1]);
					b_sum += (stack.b = pixels[yi + 2]);
					a_sum += (stack.a = pixels[yi + 3]);
					stack = stack.next;

					if(i < heightMinus1) {
						yp += width;
					}
				}
				yi = x;
				stackIn = stackStart;
				for( y = 0; y < height; y++) {
					p = yi << 2;
					pixels[p + 3] = pa = (a_sum * mul_sum) >>> shg_sum;
					if(pa > 0) {
						pa = 255 / pa;
						pixels[p] = ((r_sum * mul_sum) >>> shg_sum ) * pa;
						pixels[p + 1] = ((g_sum * mul_sum) >>> shg_sum ) * pa;
						pixels[p + 2] = ((b_sum * mul_sum) >>> shg_sum ) * pa;
					} else {
						pixels[p] = pixels[p + 1] = pixels[p + 2] = 0
					}
					p = (x + ((( p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1 ) * width )) << 2;
					r_sum -= stackIn.r - (stackIn.r = pixels[p]);
					g_sum -= stackIn.g - (stackIn.g = pixels[p + 1]);
					b_sum -= stackIn.b - (stackIn.b = pixels[p + 2]);
					a_sum -= stackIn.a - (stackIn.a = pixels[p + 3]);
					stackIn = stackIn.next;
					yi += width;
				}
			}
		}
		ctx.putImageData(imageData, top_x, top_y);

	}
})(Daisy, Daisy.$);
