class Api::V1::RegistrationsController < ApiApplicationController
	before_filter :authenticate_user_from_token!, only: [:update, :destroy]
	respond_to :json

  def create
  	# Create the user
	  resource = User.new(sign_up_params)

	  # Try to save them
	  if resource.save! 
	    render status: 200,
	    json: {
	      success: true, 
        user_token: resource.user_token,
        mobile_token: resource.mobile_authentication_token
	    }
	  else
	    # Otherwise fail
	    render status: 422,
	    json: {
	      success: false,
	      error: resource.errors
	    }
	  end 
    
  end

  def update
	  if @current_user and @current_user.update_attributes update_params
	    render status: 200, json: @current_user.as_json(only: :user_token)
	  else
	    render status: 422, json: {error: user.errors}
	  end
  end

  def destroy
  	if @current_user
  		@current_user.delete
  		head status: 200
  	else
  		render status: 422, json: {error: "Unable to cancel registration!"}
  	end
  end

	private 
		def sign_up_params
			params.require(:user).permit(:name, :email, :password, :password_confirmation, :mobile_no)
		end

		def update_params
			params.require(:user).permit(:name, :email, :mobile_no)
		end
end