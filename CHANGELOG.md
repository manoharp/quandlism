## 0.7.2

* Call line::setup function when merging data to refresh the date value for line data points.
* attributes.show is used to activate columns, NOT disable. This allows frequency/tranformation to be changed on datasets and line visibility to be maintained.

## 0.7.1

* Add build files!!

## 0.7.0

* Simplify build. render and refresh functions now being called inside of update and render functions.
* updateData function added. attachData only called when chart is built for the first time.
* Remove column visibility logic. Column visibility is determined by attributes.show, which is an array of column indicies.