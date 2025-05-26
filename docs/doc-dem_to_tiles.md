gdalwarp -r cubicspline -t_srs EPSG:3857 -dstnodata 0 mnt-marq-nkh.tiff nkh_dem_lis.tif

rio rgbify -b -10000 -i 0.1 nkh_dem_lis.tif nkh_dem_lis_rgb.tif

gdal2tiles --xyz -z 6-18 --processes=8 nkh_dem_lis_rgb.tif nkh_lis_rgb_tiles/