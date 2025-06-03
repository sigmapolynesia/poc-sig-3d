# Option 1 (GDAL)

1. Installer les outils

```bash
# Linux
apt install gdal-bin
pip install git+https://github.com/Australes-Inc/rio-rgbify.git
```

2. Corriger les données NODATA

```bash
gdalwarp -r cubicspline -co TILED=YES -t_srs EPSG:3857 -dstnodata 0 \
  ../public/assets/mnt-marq-nkh.tiff \
  ../public/assets/nkh_dem_lis.tif
```

3. Convertir l'image en RGB

```bash
rio rgbify -b -10000 -i 0.1 \
  ../public/assets/nkh_dem_lis.tif \
  ../public/assets/nkh_dem_lis_rgb.tif
```

4. Générer les tuiles

```bash
gdal2tiles.py --xyz -r near -z 6-16 --processes=8 -tilesize=512 \
  ../public/assets/nkh_dem_lis_rgb.tif \
  ../public/assets/nkh_lis_rgb_tiles/
```

# Option 2 (MBUTIL)

1. Installer les outils

```bash
# Linux
pip install git+https://github.com/Australes-Inc/rio-rgbify.git
git clone https://github.com/mapbox/mbutil.git ../
```

2. Convertir l'image en mbtiles

```bash
rio rgbify -b -10000 -i 0.1 --min-z 0 --max-z 16 -j 24 --format png \
  ../public/assets/mnt-marq-nkh.tiff \
  ../public/assets/nkh.mbtiles
```

3. Générer les tuiles

```bash
python ../mbutil/mb-util ../public/assets/nkh.mbtiles ../public/assets/nkh_mb_tiles
```
