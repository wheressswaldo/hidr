# hack4humanity

[Google Hack4Humanity 2014](https://sites.google.com/site/hack4humanitynyc/home)
[Currrent Site Link](http://104.131.16.243/)

Carolynn Vu, Christina Chan, Choonie Lee, Kong Huang

## Track#1 Ending online repression and censorship

Definition: Explore how technology can enable people to confront threats in the face of conflict, instability and repression. 

Example: Checkpoints in Syria: having the wrong data on your phone can put your life at risk.

## Hidr

As a journalist who deals with sensitive content files, I want to protect my sources and store my files in a way that would escape the notice of investigators.

This hack is a node.js application composed of 2 portions, 1 encoder and 1 decoder. 

The user provides two files: a benign base file, and a second file to be encoded and hidden in the base file (such as a transcript containing sensitive content). The user also enters a password that they will need for decoding the file.

First the user puts the two files into the application and gives a password, the backend encoder encrypts the sensitive file and embeds it into the base file. This new file is sent back to the user.

When the user opens the file without the decoder, the base file will be displayed.

When the user wants to decrypt the file, they put the encoded file and password into the application, which will give the sensitive file within the benign file.

## TODO List before Deployment

* Client side validation for files
  * Require users to enter files before submitting
  * Size validation, require base file to be 2 or 3 times bigger than the hidden file.
* ~~Delete files according to user session rather than deleting everything in the folder (current implementation will not work if multiple users are using the service at the same time)~~
* ~~Implement encryption for image files~~
* Clean up back-end hacky code for efficiency
* Documentation
* ~~Security~~
* Favicon