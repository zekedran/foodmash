class Api::V1::SessionsController < ApiApplicationController
	rescue_from ActiveRecord::RecordNotFound, with: :invalid_data
	before_filter :configure_sign_in_params, only: [:create]
	before_filter :authenticate_user_from_token!, only: [:destroy]
	before_filter :check_for_android_id!, only: :create
	respond_to :json

	def create
	  resource = User.find_for_database_authentication(email: params[:data][:user][:email]) || User.find_for_database_authentication(mobile_no: params[:data][:user][:mobile_no])
	  return failure unless resource
	  return failure unless resource.valid_password?(params[:data][:user][:password])
	  session = resource.sessions.find_by(device_id: params[:android_id])
      session_token = session.session_token if session.present?
      unless session.present?
	  	session_token = resource.generate_session_token
	  	resource.sessions.create session_token: session_token, device_id: params[:android_id]
	  end
	  render status: 201,
	    json: {
	      success: true,
	      data: {
        		user_token: resource.user_token,
        		session_token: session_token,
				user: resource.as_json(:include => [{:roles => {:include => :resource}}], except: [:otp])
          }
		}
	end

	def failure 
	  render status: 200,
	  json: {
	    success: false
	  }
	end 

	def destroy
	  return permission_denied unless params[:auth_user_token] == @current_user.user_token
	  resource = User.find_for_database_authentication(user_token: params[:auth_user_token])
	  return failure unless resource
	  resource.sessions.where(session_token: params[:auth_session_token]).first.destroy
	  render status: 201, 
	  json: {
	  	success: true
	 }
	end

	private
	 def configure_sign_in_params
	   params[:data].require(:user).permit(:email, :password, :mobile_no)
	 end
end