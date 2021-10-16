<?php
$field_name = $_POST['cf_name'];
$field_email = $_POST['cf_email'];
$field_dob = $_POST['db_name'];
$field_contact = $_POST['db_cntct'];
$field_board = $_POST['cf_board'];
$field_grad = $_POST['db_grad'];
$field_pgrad = $_POST['cf_pgrad'];
$field_emplyr = $_POST['db_emplyr'];
$field_doj = $_POST['cf_doj'];
$field_desg = $_POST['db_desg'];
$field_ctc = $_POST['db_ctc'];
$field_message = $_POST['cf_message'];

$mail_to = 'michael@nbndesign.com';
$subject = 'Job Application from a site visitor '.$field_name;

$body_message = 'From: '.$field_name."\n";
$body_message .= 'E-mail: '.$field_email."\n";
$body_message .= 'Date of Birth: '.$field_dob."\n";
$body_message .= 'Contact Number: '.$field_contact."\n";
$body_message .= 'Class 12 Marks/CGPA/Percentage: '.$field_board."\n";
$body_message .= 'Graduation Marks/CGPA/Percentage: '.$field_grad."\n";
$body_message .= 'Post-Graduation Marks/CGPA/Percentage: '.$field_pgrad."\n";
$body_message .= 'Present Employer: '.$field_emplyr."\n";
$body_message .= 'Date of Joining: '.$field_doj."\n";
$body_message .= 'Designation: '.$field_desg."\n";
$body_message .= 'Current CTC: '.$field_ctc."\n";
$body_message .= 'Message: '.$field_message."\n";

$headers = 'From: '.$field_email."\r\n";
$headers .= 'Reply-To: '.$field_email."\r\n";       

$mail_status = mail($mail_to, $subject, $body_message, $headers);

if ($mail_status) { ?>
    <script language="javascript" type="text/javascript">
        alert('Your Job Application has been recieved. We will contact you shortly.');
        window.location = 'Careers.html';
    </script>
<?php
}
else { ?>
    <script language="javascript" type="text/javascript">
        alert('Message failed');
        window.location = 'Careers.html';
    </script>
<?php
}
?>