// A random bytes generator function
module.exports = (length) => {
	let text = "";
	let possible_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for(var i=0; i<length; i++)
		text += possible_chars.charAt(Math.floor(Math.random() * possible_chars.length));

		return text;
}