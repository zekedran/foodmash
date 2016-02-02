class Web::CombosController < ApplicationController
	respond_to :json
	before_action :get_combo, only: [:update, :destroy]
	load_and_authorize_resource skip_load_resource except: [:get_offer_combos, :get_micro_combos, :get_medium_combos, :get_mega_combos, :get_combo_availability, :loadAWS]

	def index
		@combos = Combo.where(params.permit(:id, :name))
		if @combos 
			render status: 200, json: @combos.as_json(:include => :packaging_centre)
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
			render status: 201, json: @combo.as_json(:include => :packaging_centre)
		else
			render status: 422, json: @combo.errors.as_json
		end
	end

	def update
		if @combo && @combo.update_attributes(combo_update_params)
			render status: 200, json: @combo.as_json(:include => :packaging_centre)
		else
			render status: 422, json: @combo.errors.as_json
		end
	end

	def destroy
		if @combo && @combo.destroy
		  head :ok
		else
		  render status: 404, json: {error: "Combo with id #{params[:id]} not found!"}
		end
	end

	def get_offer_combos
		@offerCombos = Combo.where(group_size: 1, active: true)
		if @offerCombos
			render status: 200, json: @offerCombos.as_json(:include => [{:combo_options => {:include => {:combo_option_dishes => {:include => {:dish => {:include => {:restaurant => {only: [:id, :name]}}, only: [:id, :name, :price]} } , only: :id} }, only: [:id, :name, :description]} }, {:combo_dishes => {:include => {:dish => {:include => {:restaurant => {only: [:id, :name, :logo]}}, only: [:id, :name, :description, :price, :picture]} }, only: :id } } ], only: [:name, :price, :id, :no_of_purchases, :description, :available, :active, :picture])
		else
			render status: 404, json: {error: "Could not find offer combos"}
		end
	end

	def get_micro_combos
		@microCombos = Combo.where(group_size: 1, active: true)
		if @microCombos
			render status: 200, json: @microCombos.as_json(:include => [{:combo_options => {:include => {:combo_option_dishes => {:include => {:dish => {:include => {:restaurant => {only: [:id, :name]}}, only: [:id, :name, :price]} } , only: :id} }, only: [:id, :name, :description]} }, {:combo_dishes => {:include => {:dish => {:include => {:restaurant => {only: [:id, :name, :logo]}}, only: [:id, :name, :description, :price, :picture]} }, only: :id } } ], only: [:name, :price, :id, :no_of_purchases, :description, :available, :active, :picture])
		else
			render status: 404, json: {error: "Could not find micro combos"}
		end
	end

	def get_medium_combos
		@mediumCombos = Combo.where(group_size: 2, active: true)
		if @mediumCombos
			render status: 200, json: @mediumCombos.as_json(:include => [{:combo_options => {:include => {:combo_option_dishes => {:include => {:dish => {:include => {:restaurant => {only: [:id, :name]}}, only: [:id, :name, :price]} } , only: :id} }, only: [:id, :name, :description]} }, {:combo_dishes => {:include => {:dish => {:include => {:restaurant => {only: [:id, :name, :logo]}}, only: [:id, :name, :description, :price, :picture]} }, only: :id } } ], only: [:name, :price, :id, :no_of_purchases, :description, :available, :active, :picture])
		else
			render status: 404, json: {error: "Could not find medium combos"}
		end
	end

	def get_mega_combos
		@megaCombos = Combo.where("group_size >= ?", 3).where(active: true)
		if @megaCombos
			render status: 200, json: @megaCombos.as_json(:include => [{:combo_options => {:include => {:combo_option_dishes => {:include => {:dish => {:include => {:restaurant => {only: [:id, :name]}}, only: [:id, :name, :price]} } , only: :id} }, only: [:id, :name, :description]} }, {:combo_dishes => {:include => {:dish => {:include => {:restaurant => {only: [:id, :name, :logo]}}, only: [:id, :name, :description, :price, :picture]} }, only: :id } } ], only: [:name, :price, :id, :no_of_purchases, :description, :available, :active, :picture])
		else
			render status: 404, json: {error: "Could not find mega combos"}
		end
	end

	private
	def get_combo
		@combo = Combo.find params[:id]
	end

	def combo_params
		params.require(:combo).permit(:name, :group_size, :no_of_purchases, :description, :active, :picture, :packaging_centre_id, :category)
	end

	def combo_update_params
		params.require(:combo).permit(:name, :price, :group_size, :description, :active, :picture, :packaging_centre_id, :category)
	end
end
