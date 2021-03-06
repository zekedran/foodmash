class Api::V1::RegistrationsController < ApiApplicationController
  rescue_from ActiveRecord::RecordNotFound, with: :invalid_data
	before_filter :authenticate_user_from_token!, only: [:update, :destroy, :change_password]
	before_filter :check_for_android_id!, only: [:create, :forgot_password, :check_otp, :reset_password_from_token]
	respond_to :json

  def create
  	# Create the user
	  resource = User.new(sign_up_params)
    # Try to save them
    if resource.save 
      session_token = resource.generate_session_token
      resource.sessions.create! session_token: session_token, device_id: params[:android_id]
      SendSignupConfirmationJob.set(wait: 20.seconds).perform_later(resource)
      resource.award_mash_cash(20)
	    render status: 201,
	    json: {
	      success: true, 
        data: {
          user_token: resource.user_token,
          session_token: session_token,
          user: resource.as_json(:include => [{:roles => {:include => :resource}}], except: [:otp])
        }
	    }
	  else
	    # Otherwise fail
	    render status: 200,
	    json: {
	      success: false,
	      error: resource.errors
	    }
	  end 
    
  end

  def update
	  if @current_user and @current_user.update_attributes update_params
	    render status: 201, json: {success: true, data: @current_user.as_json(only: :user_token)}
	  else
	    render status: 200, json: {success: false, error: user.errors}
	  end
  end

  def destroy
  	if @current_user
  		@current_user.delete
  		render status: 201, json: {success: false}
  	else
  		render status: 200, json: {success: false, error: "Unable to cancel registration!"}
  	end
  end

  def check_email
  	if User.where(email: params[:data][:email]).present?
  		render status: 200, json: {success: false}
  	else
  		render status: 200, json: {success: true}
  	end
  end

  def check_mobile_no
  	if User.where(mobile_no: params[:data][:mobile_no]).present?
  		render status: 200, json: {success: false}
  	else
  		render status: 200, json: {success: true}
  	end
  end

  def change_password
  	if @current_user and @current_user.valid_password? params[:data][:user][:old_password]
  		@current_user.password = params[:data][:user][:password]
  		@current_user.password_confirmation = params[:data][:user][:password_confirmation]
  		@current_user.save
  		render status: 201, json: {success: true, message: "Password was successfully changed!"}
  	else
  		render status: 200, json: {success: false, error: "Could not change password!"}
  	end
  end

  def forgot_password
  	user = User.find_by(email: params[:data][:user][:email]) || User.find_by(mobile_no: params[:data][:user][:mobile_no])
  	if user and user.set_otp
      SendOtpJob.set(wait: 5.seconds).perform_later(user)
      MakeOtpNilJob.set(wait: 5.minutes).perform_later(user)
  		render status: 201, json: {success: true, otp: user.otp}
  	else
  		render status: 200, json: {success: false, error: "Could not reset password!"}
  	end
  end

  def check_otp
  	user = User.find_by(otp: params[:data][:otp])
  	if user and ((Time.now - user.otp_set) < 5.minutes) and user.generate_otp_token(user.otp)
  		render status: 200, json: {success: true, data: {otp_token: user.reset_password_token} }
  	else
  		render status: 200, json: {success: false, error: "Invalid password reset token!"}
  	end
  end

  def reset_password_from_token
    return invalid_data unless params[:data][:user][:otp_token]
  	user = User.find_by(reset_password_token: params[:data][:user][:otp_token])
  	user.password = params[:data][:user][:password]
  	user.password_confirmation = params[:data][:user][:password_confirmation]
    #destroy previous sessions with the same android_id
    user.sessions.where(device_id: params[:android_id]).destroy_all
    #generate a new session for the same android_id
    session_token = user.generate_session_token
    user.sessions.create! session_token: session_token, device_id: params[:android_id]
    #reset the tokens to nil
    user.reset_password_token = nil
    user.otp = nil
  	if user and user.save
  		render status: 201, json: 
  		{
  			success: true, 
        data: {
  			  user_token: user.user_token,
          session_token: session_token
        }
      }
  	else
  		render status: 200, json: {success: false, error: "Password was not reset!"}
  	end
  end

	private 
		def change_password_params
			params[:data].require(:user).permit(:old_password, :password, :password_confirmation)
		end

		def sign_up_params
			params[:data].require(:user).permit(:name, :email, :password, :password_confirmation, :mobile_no)
		end

		def update_params
			params[:data].require(:user).permit(:name, :email, :mobile_no)
		end
end