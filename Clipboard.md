before we continue on to any next steps, let's get our basic web app functionality working. Please list on the core functionality features that we have already and I will add to it starting with these functions:

1) we need to update the bottom nav bar to the icons that i created in the figma screenshot and RE-ATTCHED in a better screenshot in this chat. Review those 3 main page icons, create them and implement them on the bottom navigation bar, please.

2) We need the Kanban page to be in 'VERTICAL COLUMNS' as seen and used in Asana, Trello, Jira, ANYTYPE etc. I would like the following columns with following 'Status' properties for all 'Task' objects:

'Backlog', 'Design', 'To-Do', 'Doing/Today', 'Review', 'Done'

I have attached a screen shot of how I would like this to look exactly for the Kanban format. Ignore the task items below each column as that is all user input. See attached screenshot named: Kanban GUI for reference for this app page layout. Essentially we want side scrolling columns with vertical scroll within each 'Status' Column if our tasks start to fill the useable screen. 

3) we need the 'Add Task' page to create a new 'Task' objects based off the ANYTYPE OBJECT/Types + PROPERTIES/types framework.
Go to: anytype.io find and read their open source development philosophy and documentation. 
Let's implement this ANYTYPE object oriented philosophy/framework at the core of our app so when we come to Anytype integration, we won't have to refactor our entire codebase. 

Let's create a 'Task' object matrix identical to how ANYTYPE handles objects for all the properties that we are going to need and let me fill that matrix in starting with:

Property Name | Property Type | Property Type Options

Assignee | Human type object select | Default to current ANYTYPE Spacemember for now
Access | Multi-property-select | Home, Errand, Computer, Phone

