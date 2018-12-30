let algo = 'aes' // possible string value: aes, des, rab, rc4
  
// Event listener below is used instead of onload
document.addEventListener("DOMContentLoaded", function(event) {
		
       // 1st, we set the correct status when the page loads
	  navigator.onLine ? connectionStatus(true) : connectionStatus(false);
	
	  // now we listen for network status changes
	  window.addEventListener('online', () => {
		connectionStatus(true);
	  });
	
	  window.addEventListener('offline', () => {
		connectionStatus(false);
	  });
	  
    determineOperation()
	  
})

function connectionStatus(online)
{
	if(online)
	{
		document.getElementById('online').style.display = 'inline';
		document.getElementById('offline').style.display = 'none';
	}
	else
	{
		document.getElementById('offline').style.display = 'inline';
		document.getElementById('online').style.display = 'none';
	}
}

function determineOperation() {
    if (!document.location.hash) {
        // show creation form
      
        document.getElementById('backuptitle').style.display = 'inline';
        document.getElementById('restoretitle').style.display = 'none';
 
        //backup - restore buttons
        document.getElementById('show-message').style.display = 'none';
        document.getElementById('create-message').style.display = 'inline';
    } else {
        document.getElementById('backuptitle').style.display = 'none';
        document.getElementById('restoretitle').style.display = 'inline';
        
        //backup - restore buttons
        document.getElementById('show-message').style.display = 'inline';
        document.getElementById('create-message').style.display = 'none';
        
        document.getElementById('breaksecretphrase').style.display = 'none';
        document.getElementById('tellmemore').style.display = 'none';
    }
}

function createHash() {
    try {
         if (app.$data.thepattern.length < 5) {
        	app.$toast.open({
                    message: 'Please select a more complex pattern!',
                    type: 'is-danger',
                    duration: 6000
                });
        	return;
        }
     
        let passphrase = app.$data.thepattern+app.$data.color;
      
        let rawMessage = app.$data.wordlist.tags.toString();

        if (rawMessage.length < 1) {
        	app.$toast.open({
                    message: 'Please select the words of your seed phrase!',
                    type: 'is-danger',
                    duration: 6000
                });
        	return;
        }
        // set the cipher algorithm
        let cipher = getCipher(algo);
        // compress and encrypt
        let ciphertext = cipher.encrypt(compress(rawMessage), passphrase);
        // Set query string parameter containing crypto algo
        window.history.replaceState(null, '', '?' +  shortid());
        // Append message to URL fragment
        window.location.hash = ciphertext.toString()
        // Copy into clipboard
        Clipboard.copy(location.href);
       
        app.$toast.open({
                    message: 'Success. The URL is copied to clipboard.',
                    type: 'is-success',
                    duration: 6000
                });
    } catch(e) {
        app.$toast.open('Error: Unable to create: ' + e.message);
        console.log(e.message)
    }
}

function decodeHash() {
    try {
        let ciphertext = window.location.hash.substring(1);
        let passphrase = app.$data.thepattern+app.$data.color;
     	
        let cipher = getCipher(algo);
       
        let compressedplaintext = cipher.decrypt(ciphertext, passphrase).toString(CryptoJS.enc.Utf8);
        let plaintext = decompress(base64ToByteArray(compressedplaintext));
     
        document.getElementById('message-content').innerHTML = plaintext

        document.getElementById("modalresult").classList.add('is-active');
        
    } catch(e) {
        document.getElementById('message-content').innerHTML = 'Graphical pattern and color combination are wrong!';// + e.message;
        
        document.getElementById("modalresult").classList.add('is-active');
        
        console.error(e.message);
    }
}

function compress(data) {
    /// To compress:
    /// NOTE: mode can be 1-9 (1 is fast and pretty good; 9 is slower and probably much better).
    /// NOTE: compress() can take a string or an array of bytes.
    /// (A Node.js Buffer or a Uint8Array instance counts as an array of bytes.)
    // return return base64 string
    let base64string = btoa(String.fromCharCode.apply(null, new Uint8Array(LZMA.compress(data, 9))));
    console.log('length of compressed message: ' + base64string.length);
    return base64string;
}

function decompress(data) {
    /// To compress:
    /// NOTE: mode can be 1-9 (1 is fast and pretty good; 9 is slower and probably much better).
    /// NOTE: compress() can take a string or an array of bytes.
    /// (A Node.js Buffer or a Uint8Array instance counts as an array of bytes.)
    // return byte array
    return LZMA.decompress(data)
}

function base64ToByteArray(base64) {
    let raw = window.atob(base64)
    let rawLength = raw.length
    let array = new Uint8Array(new ArrayBuffer(rawLength))
    for(i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i)
    }
    return array
}

function getCipher(algo) {
    switch (algo) {
        case 'aes':
            return CryptoJS.AES
        case 'des':
            return CryptoJS.TripleDES
        case 'rab':
            return CryptoJS.Rabbit
        case 'rc4':
            return CryptoJS.RC4
        default:
            throw new Error('Unable to set cipher: ' + algo + ' is not valid')
    }
}
