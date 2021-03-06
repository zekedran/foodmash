class Web::CombosController < ApplicationController
	respond_to :json
	rescue_from ActiveRecord::RecordNotFound, with: :invalid_data
	before_action :get_combo, only: [:update, :destroy]
	load_and_authorize_resource skip_load_resource except: [:load_from_packaging_centre, :get_combo_availability]

	def index
		@combos = Combo.where(params.permit(:id, :name, :packaging_centre_id)).order("price ASC").where(archive: false)
		if @combos 
			render status: 200, json: @combos.as_json(:include => [{:combo_options => {:include => [{:combo_option_dishes => {:include => {:dish => {:include => [{:restaurant => {:include => :area}}, :dish_type] } } } } ] } }, {:combo_dishes => {:include => {:dish => {:include => [{:restaurant => {:include => :area }}, :dish_type]} } } }, :packaging_centre])
		else
			render status: 404, json: {error: 'Combos not found!'}
		end
	end

	def get_combo_availability
		@combo = Combo.find params[:combo][:id]
		if @combo
			render status: 200, json: @combo.as_json(only: [:id, :available, :active])
		else
			render status: 404, json: {error: 'Combo not found!'}
		end
	end

	def create
		@combo = Combo.new combo_params
		if @combo.save! 
			render status: 201, json: @combo.as_json(:include => [{:combo_options => {:include => [{:combo_option_dishes => {:include => {:dish => {:include => [{:restaurant => {:include => :area}}, :dish_type] } } } } ] } }, {:combo_dishes => {:include => {:dish => {:include => [{:restaurant => {:include => :area }}, :dish_type]} } } }, :packaging_centre])
		else
			render status: 422, json: @combo.errors.as_json
		end
	end

	def update
		if @combo && @combo.update_attributes!(combo_update_params)
			render status: 200, json: @combo.as_json(:include => [{:combo_options => {:include => [{:combo_option_dishes => {:include => {:dish => {:include => [{:restaurant => {:include => :area}}, :dish_type] } } } } ] } }, {:combo_dishes => {:include => {:dish => {:include => [{:restaurant => {:include => :area }}, :dish_type]} } } }, :packaging_centre])
		else
			render status: 422, json: @combo.errors.as_json
		end
	end

	def destroy
		if @combo && @combo.update_attributes!(archive: true, active: false)
		  head :ok
		else
		  render status: 404, json: {error: "Combo with id #{params[:id]} not found!"}
		end
	end

	def load_from_packaging_centre
		packaging_centre = PackagingCentre.find params[:combo][:packaging_centre_id]
		return invalid_data unless packaging_centre
		@loadedFromPackagingCentre = Combo.where(params.require(:combo).permit(:packaging_centre_id)).where(active: true).order("price ASC").as_json(:include => [{:combo_options => {:include => {:combo_option_dishes => {:include => {:dish => {:include => {:restaurant => {only: [:id, :name, :logo]}}, only: [:id, :name, :price, :description, :picture, :label, :dish_type_id]} } , only: :id} }, only: [:id, :min_count, :name, :priority]} }, {:combo_dishes => {:include => {:dish => {:include => {:restaurant => {only: [:id, :name, :logo]}}, only: [:id, :name, :description, :price, :picture, :label]} }, only: [:id, :min_count] } } ], only: [:name, :price, :id, :description, :available, :active, :picture, :label, :group_size, :category, :customizable])
		user = User.find_by(user_token: params[:auth_user_token]) if params[:auth_user_token]
		hash = Digest::SHA1.hexdigest(@loadedFromPackagingCentre.to_s)
		if @loadedFromPackagingCentre
			render status: 200, json: 
			{
				data:
				{
					combos: @loadedFromPackagingCentre, 
					hash: hash,
					user: user.as_json(:include => {:roles => {:include => :resource}})
				}
			}
		else
			render status: 404, json: {error: "Could not load combos"}
		end
	end

	private
	def get_combo
		@combo = Combo.find params[:id]
	end

	def combo_params
		params.require(:combo).permit(:name, :group_size, :description, :active, :picture, :packaging_centre_id, :category, :customizable)
	end

	def combo_update_params
		params.require(:combo).permit(:name, :price, :group_size, :description, :active, :picture, :packaging_centre_id, :category, :customizable)
	end
end
