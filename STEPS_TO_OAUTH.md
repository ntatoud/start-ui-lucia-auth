1. [] Add your app on your provider's platform

2. [] Retrieve PROVIDER_CLIENT_ID and PROVIDER_CLIENT_SECRET and add it to your .env

3. [] Add the variables to your createEnv

4. [] Create your provider and ProviderUser schemas in server/config/oauth/providers/<provider_name>/ folder

5. [] Add your provider to the types in server/config/oauth/schemas.ts 

6. [] Add the provider's login button to the the SocialLogin component (don't forget the logo)

7. [] Add your provider specific integration to the different methods in server/config/oauth/utils and server/config/oauth/providers/<provider_name>.ts

8. [] Enjoy