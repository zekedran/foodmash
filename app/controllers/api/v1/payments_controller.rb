class Api::V1::PaymentsController < ApiApplicationController
 	respond_to :json
 	rescue_from ActiveRecord::RecordNotFound, with: :invalid_data
 	prepend_before_filter :authenticate_user_from_token!, except: [:success, :failure]
	before_filter :set_or_create_cart, only: [:purchase_by_cod, :get_hash, :apply_promo_code, :apply_mash_cash]
	before_filter :apply_promo_or_mash_cash, only: [:purchase_by_cod, :get_hash]
	before_filter :set_payu_processed_cart, only: [:success, :failure]

 	def index 
 		render status: 200
 	end
 	 
	def get_hash
		details = {
			firstname: @current_user.name.split.first,
			productinfo: 'a bunch of combos from Foodmash',
			surl: 'http://www.foodmash.in/api/v1/payments/success',
			furl: 'http://www.foodmash.in/api/v1/payments/failure',
			amount: @cart.grand_total.to_s,
			txnid: @cart.generate_order_id,
			email: @current_user.email,
			phone: @current_user.mobile_no,
			udf1: '',
			udf2: '',
			udf3: '',
			udf4: '',
			udf5: '',
		}
		checksum = Payment.calculate_hash(details) || nil
		if checksum.present?
			render status: 200, json: {success: true, data: {hash: checksum, order_id: @cart.order_id}}
		else
			render status: 200, json: {success:true, error: 'Was not able to calculate hash!'}
		end
	end

	def get_mobile_sdk_hash
		checksum = Payment.calculate_mobile_sdk_hash || nil
		if checksum.present?
			render status: 200, json: {success: true, data: {hash: checksum}}
		else
			render status: 200, json: {success: true, error: 'Was not able to calculate mobile sdk hash!'}
		end
	end

	def get_payment_details_for_mobile_sdk
		checksum = Payment.calculate_hash_for_mobile_sdk(params[:data])
		if checksum.present?
			render status: 200, json: {success: true, data: {hash: checksum}}
		else
			render status: 200, json: {success: false, error: 'Was not able to calculate hash'}
		end
	end

	def success
		@user = @cart.user
 		if params.present? and @success and @cart.add_fields_from_payu(params) and @user.award_mash_cash(check_for_promo_and_set(@cart), @cart) and @cart.purchase!
			render 'mobile_success.html'
		else
			render 'mobile_failure.html'
		end
 	end

 	def failure
 		if params.present? and @cart.add_fields_from_payu(params)
			render 'mobile_failure.html'
		else
			render 'mobile_failure.html'
		end	
 	end

 	def apply_promo_code
 		return invalid_data unless @cart
 		success, promo_discount, grand_total = @cart.apply_promo_code(params[:data][:promo_code].downcase)
 	 	if success and promo_discount
 	 		render status: 200, json: {success: success, data: {promo_discount: promo_discount, grand_total: grand_total}}
 	 	else
 			render status: 200, json: {success: success, error: 'Pomo code was invalid!'}
 	 	end
 	end

 	def apply_mash_cash
 		return invalid_data unless @cart
 		success, mash_cash, grand_total = @cart.apply_mash_cash(params[:data][:mash_cash].to_f)
 		if success and mash_cash and mash_cash > 0.0
 			render status: 200, json: {success: success, data: {mash_cash: mash_cash, grand_total: grand_total}}
 		else
 			render status: 200, json: {success: success, error: 'Mash Cash could not be applied!'}
 		end
 	end

	def purchase_by_cod
		return invalid_data unless params[:data][:payment_method]
		if @success and @cart.set_payment_method('COD') and @current_user.award_mash_cash(check_for_promo_and_set(@cart), @cart) and @cart.purchase!
			render status: 200, json: {success: true, data: {order_id: @cart.order_id, promo_discount: @cart.promo_discount}}
		elsif @cart.set_payment_method('COD') and @cart.purchase! 
			render status: 200, json: {success: true, data: {order_id: @cart.order_id}}
		else
			render status: 200, json: {success: false, error: 'Password was incorrect!'}
		end
	end

	private
	def set_or_create_cart
		session = @current_user.sessions.where(session_token: params[:auth_session_token]).first
		return permission_denied unless session
	  if @current_user 
	    @cart = @current_user.carts.where(aasm_state: 'not_started').first.presence || Cart.create(user_id: @current_user.id)
	    @cart.generate_order_id if !@cart.order_id.present?
	  end
	end

	def check_for_promo_and_set(cart)
 		if (cart.promo_discount.present? and cart.promo_id.present?) or cart.mash_cash.present?
 			return 0.0
 		else
 			return 0.0
 		end
 	end

 	def set_payu_processed_cart
 		@cart = Cart.find_by(order_id: params[:txnid])
 	end

 	def apply_promo_or_mash_cash
 		@success = nil
 		if params[:data].present? and params[:data][:promo_code].present?
 			@success, promo_discount, grand_total = @cart.apply_promo_code(params[:data][:promo_code].downcase)
 		end
 		if params[:data].present? and params[:data][:mash_cash].present?
 			@success, mash_cash, grand_total = @cart.apply_mash_cash(params[:data][:mash_cash].to_f)
 		end
 		if @success and promo_discount
 			promo = Promo.find_by(code: params[:data][:promo_code].downcase)
 			promo.users << @current_user
 			@cart.promo_id = promo.id
 			@cart.promo_discount = params[:data][:promo_discount].to_f if params[:data][:promo_discount]
 		elsif @success and mash_cash
 			@cart.mash_cash = params[:data][:mash_cash].to_f if params[:data][:mash_cash] 
 		end
 	end
 end