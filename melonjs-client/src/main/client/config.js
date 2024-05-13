const CONFIG = {
	appName: "{{applicationName}}",
	appVersion: "{{applicationVersion}}",

	baseURL: "",

	// if we are running in development, we are going to use a
	// baseURL from local settings.
	// else we use prod now.
	local: {
		// Use localhost if you don't care about multiplayer
		baseURL: "http://localhost:8080/",
		
		// Use a real IP address if you want to do multiplayer testing
		//baseURL: "http://192.168.2.228:8080/",
		//baseURL: "http://192.168.2.171:8080/",
	},

	// use this one for the quarkus engine on production systems
	// {{baseURL}} will be replaced with the corresponding
	// ENVIRONMENT parameter, provided via ConfigMap
	prod: {
		baseURL: "{{baseURL}}",
	},
};

export default CONFIG;
