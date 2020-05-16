"""
A set of utilitarian functions to facilitate cooperation with the file system.
"""

import os

def get_all_file_paths(directory):
    """ Return a list of full file paths inside a given directory. """
    file_paths = [] 
    for root, directories, files in os.walk(directory): 
        for filename in files: 
            filepath = os.path.join(root, filename) 
            file_paths.append(filepath) 
    return file_paths

def create_directory(path):
    """ Create a directory structure if it doesn't exist. """
    success = 1
    if not os.path.isdir(path):
        paths = path.split('/')
        if len(paths) == 1:
            paths = paths[0].split('\\')
        for i in range(len(paths)):
            if not create_single_directory('/'.join(paths[:i+1])):
                success = 0
    return success

def create_single_directory(path):
    """
    Create a directory if it doesn't exist.
    Cannot generate nested structure - use create_directory if unsure.
    """
    success = 1
    if not os.path.isdir(path):
        try:
            os.mkdir(path)
        except OSError:
            print('Failed to create {} directory.'.format(path))
            success = 0
    return success
