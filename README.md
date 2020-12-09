# CS2102_2021_S1_Team16 – Pet Caring Service (PCS)

[Project Report](Documentation/Project%20Report.pdf) |
[Demo Video](Documentation/Demo.mp4) |
[Demo Video Link](https://drive.google.com/file/d/1VWdctg8ybNDJVkMz9oQdRybxHU2tRb1H/view?usp=sharing)

## What is PCS?
PCS is an application that allows pet owners to search for care takers for their pets for certain periods of time. 
After the transaction, they can leave a rating and review for the care taker. 

Care takers can either be part-timers or full-timers. 
They can specify the pets that they can take care of and specify their availability (if they are part-timers) or 
apply for leaves (if they are full-timers). They can view their past orders and the salary for the month. 

PCS administrators can create accounts for care takers and other administrators. Administrator accounts can be deleted 
except for the root account. Administrators will be able to view the summarised 
statistics for the year as well as for any month. 

## Optimal platform
The encouraged browser to run the application is Google Chrome since the interface scaling is done with Google Chrome. By using other browsers, the positioning and dimensions of the components may be off and does not look good. Some components may not work properly like datepickers since at the time of development, Safari does not support the use of datepickers.

## Accounts to try out
Some accounts that can be used to test our web application can be found in [seeds1.sql](app/sql/seeds1.sql). 
We have used the following accounts for our demo video: 

### Care Taker

#### Part-timer
Username: vattowd  
Password: jZLV67dmox0h

#### Full-timer
Username: sgemnett9  
Password: cnkcqCnW6

### Pet Owner
Username: rbaudinet1n  
Password: dVbDw53iUl0F

### Administrator
Username: root  
Password: root12345

Username: thaacker23  
Password: FhrdC8js1

## Updates
### v1.1

A few improvements on UI/UX and application security have been made:

UI: 
- The 'Find a caretaker' tab has been removed for caretakers and admins since they do not use the functionality.
- Find caretaker now only allows searching for owned pet types instead of showing all pet types.
- An 'Add pet' menu option has been added to the user dropdown menu for pet owners to quickly access the add pet form instead of traversing through 'Profile'. It is also better for first time pet owners to easily locate the feature.
- Pet summary now shows none instead of blank if there is no need for walk.
- Current and past jobs or orders are now seperated for better view.
- The action buttons beside jobs in caretaker's profile has improved wording.
- Monthly report request form now uses drop down list for month.
- Monthly report now displays the most recent month first.
- Pages redirected to login will now return back to the requested page after logging in.

Security and Error recovery: 
- Pages that requires user credentials will now be redirected to the login page if the user has yet to log in.
- All 'if's in the router has been closed with an 'else' to prevent exception cases from landing in a deadend.

Fixes:
- Credit card option will not show when there is no credit card number registered.

Future work:
- Add the 'Apply leave'/'Add availability' option to the user dropdown menu
- Allow caretaker to apply or add a range of leaves or availability respectively.
- Combine the pet owner/caretaker mode for users holding multiple identities.
- Redirect all unauthorized POST requests to a sinkhole to prevent information leakage.