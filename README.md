# minion: a tagging tool

## The main idea
Minion was created as a personal project for tagging a vast library of locally stored images. It has been in development since February 2020. Minion-official is a demo of the actual tool, stripped of all the aspects specific to the main project.

The intended usage is to download the project and run it locally, but a working demo can also be found [online](http://gamerandomizer.000webhostapp.com/minion/). It is also entirely mobile-unfriendly, as it is only intended to be used with a large screen and keyboard.

It is quite likely that this project will at some point evolve into something more noteworthy, but no fleshed-out plans have been conceived in that regard yet.

## The underlying data source
As the original project is intended as a local solution, minion utilizes no external database or API for storing its data and files. The project can quite easily be converted to use a different data source and load images from an external location, but that exceeds the purposes of this demo.

As a result, there is no way to save changes in the online version of the app. The data.json and the FS scripts can be downloaded, but will make no sense.

## Usage manual
The app was developed as a keyboard-only tool. Many actions can be executed with a mouse as well, but under the hood, those are also terminal commands. The only exception is actually triggering the download of save data/FS scripts.

There is no in-built help system developed (for a personal project that seemed unnecessary), therefore I append a command reference. All arguments are passed in a space-delimited fashion, e.g. **tag subject command_manual cm**.

### Display manipulation
>**next**: loads the next page of images, if applicable. Also accessible by pressing Page Down or a button in the right panel.

>**prev**: counterpart to **next**

>**page_size**/**ps** (*number*): sets the maximum number of images to be shown on a single page. The intention is to have exactly as many visible as fit comfortably onto the screen without scrolling. The default can be set under **src/data/settings.json**.

>**max_width**/**mw** (*number*): sets the maximum width of images to be shown on a page. The intention is to have exactly as many visible as fit comfortably onto the screen without scrolling. The default can be set under **src/data/settings.json**.

>**zoom**: toggles between showing a page of images or a single image. If showing a single image, it is always selected and it is the only one selected, thus enabling all the image-altering commands without need for selecting.

>**page** (*number*): goes to a specified page of results.

>**images**: changes the main display to show images (other possible states: stats, save).

### Terminal mode
>**input_toggle**: toggles the terminal between command mode and tagging mode. In command mode (default), all the commands described here are applicable. In tagging mode, commands are forbidden - the only one that is executed automatically is add/remove tags. Toggling also possible by pressing acute (tilde without shift, `).

### Selection change
>**select**/**s** (*0 or more numbers*): selects images with the specified IDs (the first number visible in the upper left corner of each image). If passed no parameters, selects all images.

>**deselect**/**ds** (*0 or more numbers*): counterpart to **select**.

>**super_select**/**ss** (*0 or more space-delimited numbers*): for every specified ID, toggles the selection status of the relevant image. If passed no parameters, this equates to inverting selection.

>**select_range**/**sr** (*number*, *number*): selects all the images between and including the specified IDs.

>**deselect_range**/**dsr** (*number*, *number*): counterpart to **select_range**.

>**super_select_range**/**ssr** (*number*, *number*): performs the **super_select** for all the images between and including the specified IDs.

### Tagging
>**add** (*1 or more existing tags*): adds the specified tags to the selected images. Tags can be referred to by their full name, by their full name disregarding floors ('_') or by their aliases.

>**remove**/**rm** (*1 or more existing tags*): counterpart to **add**.

>**clear_tags**/**notag**: removes all tags from the selected images.

### Commenting
>**comment**/**x** (*1 or more words*): adds a comment to the selected images. This feature is very under-developed and only allows lowercase words with no punctuation.

>**remove_comment**/**-comment** (*number*): removes a comment with the specified ID from the selected images. Comments and their IDs can be seen under tags in the right panel.

### Information
>**aliases**/**as** (*data type*, *name or alias*): displays all the aliases of a specified resource. Data types include: **category**, **tag**, **command**.

>**free_index**/**fi**/**free**: displays the first free minion index. Important for adding new images through the add.py script located under **addMinions**. The feature of adding data is under-developed due to the personal nature of the main project - to be corrected if a more serious version was to be made public.

### Data types manipulation
>**category**/**cat** (*name*, *0 or more aliases*): creates a category.

>**rename_category**/**rc** (*old name*, *new name*): renames a category.

>**combine_categories**/**cc** (*category*, *category*): fuses the second category into the first.

>**remove_category**/**rmc** (*category*): removes a category. All tags assigned to this category are moved to the **other** category (which will be created if it doesn't exist).

>**tag**/**t** (*category*, *name*, *0 or more aliases*): creates a tag in the given category.

>**rename_tag**/**rt** (*old name*, *new name*): renames a tag.

>**combine_tags**/**ct** (*tag*, *tag*): fuses the second tag into the first.

>**change_tag_category**/**ctc** (*tag*, *category*): moves the tag to the given category.

>**remove_tag**/**rmt** (*tag*): removes the tag.

>**find_tag**/**ft** (*full or partial word*): lists all tags that have names and/or aliases containing the provided phrase.

>**alias**/**a** (*data type*, *name*, *1 or more aliases*): adds aliases to the instance of the given data type.

### Filtering
>**filter**/**f** (*filter condition*, *filter type*, *1 or more arguments*): filters the images. **filter condition** can be set to **has**/**no**/**any**. **filter type** is either **tag** or **special**. Arguments are either tag names/aliases or, for **special**, **notag** or **hascomment**. Everything is self-explanatory.

>**remove_filter**/**-filter**/**-f** (*filter condition*, *filter type*, *1 or more arguments*): removes filters set by **filter**.

>**special_filter**/**sf** (*1 or more arguments*): a shorthand version for executing special filters.

>**remove_special_filter**/**-sf** (*1 or more arguments*): a shorthand version for removing special filters.

>**refilter**/**ff**: re-applies the current filters, as this is not done at runtime.

>**clear_filter**/**nofilter**/**nf**/**cf**: removes all filters.

>**total_random_tagging**/**trt**: enters the state of "total random tagging", which in the demo amounts to setting a special "no tag" filter and zooming in to the first image.

### Statistics
>**general_stats**: changes the main display to show general statistics (other possible states: images, stats). Also accessible through a button in the right panel. This feature is sadly quite unimpressive in the demo version.

>**tag_stats**: changes the main display to show tag statistics (other possible states: images, stats). Also accessible through a button in the right panel. Shows how many times tags occur. Clicking them applies a filter to show only the applicable images.

### Saving
>**save**: changes the main display to show simplified save data (other possible states: images, stats). Mainly for debugging purposes.

>**prepare_save**: prepares a data.json file for downloading. For a local setup, this would replace the current version of data.json under **src/data**. Also accesible as a button in the right panel. Downloading requires pressing the last button in the right panel.

>**io_move**: prepares an io.py script for downloading. This would move selected images out of **public/img/img** to **public/img/output**. Also accesible as a button in the right panel. Downloading requires pressing the last button in the right panel.

>**io_copy**: prepares an io.py script for downloading. This would copy selected images out of **public/img/img** to **public/img/output**. Also accesible as a button in the right panel. Downloading requires pressing the last button in the right panel.

>**delete**: marks the selected images for deletion. When data is saved, those images' data will be omitted. To also get rid of the image files, executing the io_move is necessary as well.

## Technologies used:

* React - visit [reactjs.org](https://reactjs.org/). The project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
* TypeScript - visit [typescriptlang.org](https://www.typescriptlang.org/)
* Also, plain old Javascript, CSS and HTML.

Developed using [Visual Studio Code](https://code.visualstudio.com/)

## Author

**Artur Szpot** ([GitHub](https://github.com/artur-szpot))

## Additional resources

* Font Awesome 5 Free ([GitHub project page](https://github.com/FortAwesome/Font-Awesome), [official website](https://fontawesome.com/))

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.