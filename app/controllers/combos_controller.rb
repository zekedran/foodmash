class CombosController < ApplicationController
	respond_to :json
	before_action :get_combo, only: [:show, :update, :destroy]

	def index
		@combos = Combo.all
		if @combos 
			render status: 200, json: @combos.as_json
		else
			render status: 404, json: {error: 'Combos not found!'}
		end
	end

	def create
		@combo = Combo.new combo_params
		if @combo.save 
			render status: 201, json: @combo.as_json
		else
			render status: 422, json: @combo.errors.as_json
		end
	end

	def show
		if @combo
			render status: 200, json: @combo.as_json
		else
			render status: 404, json: {error: "Combo with id #{params[:id]} was not found!"}
		end
	end

	def update
		if @combo && @combo.update_attributes(combo_update_params)
			render status: 200, json: @combo.as_json
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
		offerCombos = Combo.where(group_size: 1)
		if offerCombos
			render status: 200, json: offerCombos.as_json
		else
			render status: 404, json: {error: "Could not find offer combos"}
		end
	end

	def get_micro_combos
		microCombos = Combo.where(group_size: 1)
		if microCombos
			render status: 200, json: microCombos.as_json
		else
			render status: 404, json: {error: "Could not find micro combos"}
		end
	end

	def get_medium_combos
		mediumCombos = Combo.where(group_size: 2)
		if mediumCombos
			render status: 200, json: mediumCombos.as_json
		else
			render status: 404, json: {error: "Could not find medium combos"}
		end
	end

	def get_mega_combos
		megaCombos = Combo.where("group_size >= ?", 3)
		if megaCombos
			render status: 200, json: megaCombos.as_json
		else
			render status: 404, json: {error: "Could not find mega combos"}
		end
	end


	private
	def get_combo
		combo = Combo.find params[:id]
	end

	def combo_params
		params.require(:combo).permit(:name, :price, :group_size, :no_of_purchases)
	end

	def combo_update_params
		params.require(:combo).permit(:name, :price, :group_size)
	end
end
