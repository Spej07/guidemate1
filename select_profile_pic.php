<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GuideMate | Select Profile Picture</title>
    <script src="https://kit.fontawesome.com/ed5caa5a8f.js" crossorigin="anonymous"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="SignupTouristAdmin.css">
</head>
<body>

    <div class="signup-wrapper">
        <div class="main-card">
            <div class="image-panel">
                <div class="overlay"></div>
                <div class="panel-content">
                    <div class="brand-logo">
                        <i class="fa-solid fa-earth-americas"></i>
                        <span>GuideMate</span>
                    </div>
                    <div class="hero-text">
                        <h1>Choose Your Avatar</h1>
                        <p>Upload a profile picture to personalize your GuideMate experience.</p>
                    </div>
                </div>
            </div>

            <div class="form-panel">
                <div class="form-header">
                    <h2>Select Profile Picture</h2>
                    <p>Upload an image or skip to use the default.</p>
                </div>

                <form id="profile-pic-form" action="update_profile_pic.php" method="POST" enctype="multipart/form-data">
                    <input type="hidden" name="user_id" id="user_id">
                    <input type="hidden" name="role" id="role">

                    <div class="input-box">
                        <label><i class="fa-solid fa-camera"></i> Profile Picture</label>
                        <input type="file" name="profile_image" accept="image/*" required>
                        <small>Supported formats: JPG, PNG, GIF. Max size: 2MB.</small>
                    </div>

                    <button type="submit" class="primary-btn" style="margin-top: 20px;">Upload & Continue</button>
                    <button type="button" onclick="skipProfilePic()" class="primary-btn" style="margin-top: 10px; background: #ccc; color: #000;">Skip for Now</button>
                </form>
            </div>
        </div>
    </div>

    <script>
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        document.getElementById('user_id').value = urlParams.get('user_id') || '';
        document.getElementById('role').value = urlParams.get('role') || '';

        function skipProfilePic() {
            // Redirect to signin without uploading
            window.location.href = 'signinTouristAdmin.html';
        }
    </script>
</body>
</html>