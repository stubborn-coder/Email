document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = () => {send_email();}
  // document.querySelector('#send-email').disabled = true;
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch('/emails/'+mailbox)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log("emails:");
    console.log(emails);
    emails.forEach(email => {
      
      console.log(email.read);
      document.querySelector('#emails-view').innerHTML += `<div class="email border border-success border-5 ${email.read ? '' : 'bg-secondary'}" id="${email.id}" data-sender=${email.sender} data-recipients=${email.recipients} data-subject=${email.subject} data-timestamp=${email.timestamp} data-read= ${email.read} data-id=${email.id}  data-archived=${email.archived}>
      <p class="bold">${email.sender}</p>
      <p class="subject">${email.subject}</p>
      </div>`
      
    });

     emails = document.querySelectorAll('.email');

     emails.forEach( (email) => {
        
      email.addEventListener('click', () => {
        
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'none';
        document.querySelector('#single-email-view').style.display = 'block';
        
        fetch('emails/'+email.dataset.id)
        .then(response => response.json())
        .then(data => {

          document.querySelector('#single-email-view').innerHTML = `
            <p>From: ${data.sender}</p>
            <p>To:${data.recipients}</p>
            <p>Subject:${data.subject}</p>
            <p>Timestamp:${data.timestamp}</p>
            <p>Body: ${data.body}</p>
            <button class="btn btn-primary reply-btn">Reply</button>
            ${mailbox !== 'sent' ? '<button class="btn btn-primary archive-btn">${data.archived ? "Unarchive" : "Archive"}</button>' : '' }
            <button class="btn btn-primary unread-btn">unread</button>`

          if(mailbox !== 'sent'){
            document.querySelector('.archive-btn').addEventListener('click', () => {
        
              fetch('/emails/'+data.id, {
                method: 'PUT',
                body: JSON.stringify({
                  archived: data.archived ? false : true,
                })
              })
              .then(response => {
                console.log(response);
                data.archived ? load_mailbox('archive') : load_mailbox('inbox')
                
              });
  
            });
          }

          document.querySelector('.unread-btn').addEventListener('click', () => {
            
            fetch('emails/'+email.dataset.id, {
              method: 'PUT',
              body: JSON.stringify({
                read:false
              })
            })
            .then(console.log("marked as unread"))
            .then(location.reload());
             
          });

          document.querySelector('.reply-btn').addEventListener('click', () => {
            let recipients = data.recipients;
            let subject = "Re: "+ data.subject;
            let body =`On ${data.timestamp} ${data.sender} wrote:
            "${data.body}"
            ---------------------------------------------`;

            compose_email();

            // Set the text
            document.querySelector('#compose-recipients').value = recipients;
            document.querySelector('#compose-subject').value = subject;
            document.querySelector('#compose-body').value = body;

          })
    
            
        });

        if(email.dataset.read){
          fetch('emails/'+email.dataset.id, {
            method: 'PUT',
            body: JSON.stringify({
              read:true
            })
          })
          .then(console.log("marked as read"));
        }

      });


    });

    // ... do something else with emails ...
  });
}

function send_email() {
  let recipients = document.querySelector('#compose-recipients').value
  let subject = document.querySelector('#compose-subject').value
  let body = document.querySelector('#compose-body').value

  console.log(recipients)
  console.log(subject)


  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
  
  
}
