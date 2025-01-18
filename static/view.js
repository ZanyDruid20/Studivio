// Toggle visibility of the 'Add Task' form
document.getElementById('add-task-btn').addEventListener('click', function() {
    document.getElementById('add-task-section').classList.toggle('show');
});

// Handle task addition via the form submission
document.getElementById('add-task-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get the values from the form
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const time = document.getElementById('task-time').value;
    const priority = document.getElementById('task-priority').value;

    // Send a POST request to add the task to the backend
    fetch('/add_task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: title,
            description: description,
            time: time,
            priority: priority
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Add the task to the task list in the frontend
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item', 'border', 'p-3', 'mb-3');
            taskItem.innerHTML = `
                <h3 class="task-title">${title}</h3>
                <p class="task-description">${description}</p>
                <p class="task-time">Time: ${time} minutes</p>
                <p class="task-priority">Priority: ${priority}</p>
                <div>
                    <a href="#" class="btn btn-warning btn-sm mr-2 edit-btn text-white">Edit</a>
                    <form class="delete-form" method="POST">
                        <input type="hidden" name="task_id" value="${data.taskId}">
                        <button type="submit" class="btn btn-danger btn-sm">Delete</button>
                    </form>
                </div>
            `;
            // Append the task to the task list
            document.querySelector('.task-list').appendChild(taskItem);

            // Clear the form inputs
            document.getElementById('add-task-form').reset();

            // Close the task form
            document.getElementById('add-task-section').classList.remove('show');
        } else {
            alert('Error adding task: ' + data.error);
        }
    })
    .catch(error => {
        alert('An error occurred: ' + error);
    });
});

// Handle task deletion
document.querySelectorAll('.delete-form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const taskItem = form.closest('.task-item');
        const taskId = form.querySelector('input[name="task_id"]').value;

        // Send a DELETE request to remove the task from the backend
        fetch(`/delete_task/${taskId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Remove the task from the frontend if the deletion was successful
                taskItem.remove();
            } else {
                alert('Error deleting task: ' + data.error);
            }
        })
        .catch(error => {
            alert('An error occurred: ' + error);
        });
    });
});

// Handle task editing (assuming there's an 'Edit' button and route for editing tasks)
document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();

        const taskItem = button.closest('.task-item');
        const taskId = taskItem.querySelector('input[name="task_id"]').value;
        const title = taskItem.querySelector('.task-title').textContent;
        const description = taskItem.querySelector('.task-description').textContent;
        const time = taskItem.querySelector('.task-time').textContent.replace('Time: ', '').replace(' minutes', '');
        const priority = taskItem.querySelector('.task-priority').textContent.replace('Priority: ', '');

        // Show the edit form with the current task data
        document.getElementById('task-title').value = title;
        document.getElementById('task-description').value = description;
        document.getElementById('task-time').value = time;
        document.getElementById('task-priority').value = priority;

        // Update the form action to edit the task
        document.getElementById('add-task-form').setAttribute('data-task-id', taskId);
        document.getElementById('add-task-form').setAttribute('data-action', 'edit');
    });
});

// Handle task update
document.getElementById('add-task-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const taskId = this.getAttribute('data-task-id');
    const action = this.getAttribute('data-action');

    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const time = document.getElementById('task-time').value;
    const priority = document.getElementById('task-priority').value;

    // If editing, send a PUT or PATCH request to update the task
    if (action === 'edit') {
        fetch(`/edit_task/${taskId}`, {
            method: 'PUT', // or PATCH
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                description: description,
                time: time,
                priority: priority
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update the task in the frontend
                const taskItem = document.querySelector(`[data-task-id="${taskId}"]`);
                taskItem.querySelector('.task-title').textContent = title;
                taskItem.querySelector('.task-description').textContent = description;
                taskItem.querySelector('.task-time').textContent = `Time: ${time} minutes`;
                taskItem.querySelector('.task-priority').textContent = `Priority: ${priority}`;

                // Clear the form inputs
                document.getElementById('add-task-form').reset();
                document.getElementById('task-title').focus();
            } else {
                alert('Error updating task: ' + data.error);
            }
        })
        .catch(error => {
            alert('An error occurred: ' + error);
        });
    }
});
