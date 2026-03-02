const token = localStorage.getItem("token");
if (!token) {
    alert("Session expired. Please login.");
    window.location.href = "/admin-login";
}

//LOAD USERS
async function loadUsers() {
    try {
        const res = await fetch("/dashboard/admin/users/list", {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!res.ok) {
            console.error("Failed to load users:", res.status, await res.text());
            const tbody = document.getElementById("users-body");
            tbody.innerHTML = "<tr><td colspan='4'>Failed to load users</td></tr>";
            return;
        }

        const users = await res.json();
        const tbody = document.getElementById("users-body");
        tbody.innerHTML = "";

        if (!users || users.length === 0) {
            tbody.innerHTML = "<tr><td colspan='4'>No users found</td></tr>";
            return;
        }

        users.forEach(u => {
            let firstName = u.first_name || "";
            let lastName = u.last_name || "";
            let fullName = (firstName + " " + lastName).trim();

            const tr = document.createElement("tr");

            const actionsTd = document.createElement("td");

            // Admin ko show na kare, sirf label
            if (u.role === "admin") {
                actionsTd.innerHTML = `<span style="color:red;font-weight:600">ADMIN</span>`;
            } else {
                actionsTd.innerHTML = `
                    <button class="edit-btn" onclick="editUser(${u.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteUser(${u.id})">Delete</button>
                `;
            }

            tr.innerHTML = `
                <td>${fullName}</td>
                <td>${u.email}</td>
                <td>${u.role}</td>
            `;
            tr.appendChild(actionsTd);
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
        const tbody = document.getElementById("users-body");
        tbody.innerHTML = "<tr><td colspan='4'>Error loading users</td></tr>";
    }
}

//EDIT USER
function editUser(id) {
    fetch(`/dashboard/admin/users/${id}`, {
        headers: { "Authorization": "Bearer " + token }
    })
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch user");
            return res.json();
        })
        .then(user => {
            document.getElementById("edit_user_id").value = user.id;
            document.getElementById("edit_first_name").value = user.first_name || "";
            document.getElementById("edit_last_name").value = user.last_name || "";
            document.getElementById("edit_email").value = user.email || "";
            document.getElementById("edit_role").value = user.role;
            document.getElementById("edit-user-modal").style.display = "flex";
        })
        .catch(err => console.error(err));
}

function closeEditModal() {
    document.getElementById("edit-user-modal").style.display = "none";
}

//UPDATE USER
async function updateUser() {
    const id = document.getElementById("edit_user_id").value;
    const first_name = document.getElementById("edit_first_name").value;
    const last_name = document.getElementById("edit_last_name").value;
    const email = document.getElementById("edit_email").value;
    const role = document.getElementById("edit_role").value;

    const res = await fetch(`/dashboard/admin/users/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ first_name, last_name, email, role })
    });

    const data = await res.json().catch(() => ({}));
    alert(data.message || "User updated");

    closeEditModal();
    loadUsers();
}

//DELETE USER
async function deleteUser(id) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const res = await fetch(`/dashboard/admin/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json().catch(() => ({}));
    alert(data.message || "User deleted");
    loadUsers();
}

//LOGOUT
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/admin-login";
}

//PAGE LOAD
document.addEventListener("DOMContentLoaded", loadUsers);