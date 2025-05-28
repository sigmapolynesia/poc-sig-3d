Option 1:

gdalwarp -r cubicspline -co TILED=YES -t_srs EPSG:3857 -dstnodata 0 mnt-marq-nkh.tiff nkh_dem_lis.tif

rio rgbify -b -10000 -i 0.1 nkh_dem_lis.tif nkh_dem_lis_rgb.tif

gdal2tiles --xyz -r near -z 6-18 --processes=8 -tilesize=512 nkh_dem_lis_rgb.tif nkh_lis_rgb_tiles/



Option 2:

rio rgbify -b -10000 -i 0.1 --min-z 0 --max-z 16 -j 24 --format png mnt-marq-nkh.tiff nkh.mbtiles

python mb-util nkh.mbtiles nkh_mb_tiles



pip install git+https://github.com/Australes-Inc/rio-rgbify.git