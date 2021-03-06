class OwnedDevicesController < ApplicationController
  before_action :set_owned_device, only: [:show, :edit, :update, :destroy]

  # GET /owned_devices
  # GET /owned_devices.json
  def index
    # puts current_user

    # @owned_devices = OwnedDevice.all
    @owned_devices = current_user.owned_devices #OwnedDevice.all
  end

  # GET /owned_devices/1
  # GET /owned_devices/1.json
  def show
  end

  # GET /owned_devices/new
  def new
    @owned_device = OwnedDevice.new
  end

  # GET /owned_devices/1/edit
  def edit
  end

  # POST /owned_devices
  # POST /owned_devices.json
  def create
    @owned_device = OwnedDevice.new(owned_device_params)

    respond_to do |format|
      if @owned_device.save
        format.html { redirect_to @owned_device, notice: 'Owned device was successfully created.' }
        format.json { render :show, status: :created, location: @owned_device }
      else
        format.html { render :new }
        format.json { render json: @owned_device.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /owned_devices/1
  # PATCH/PUT /owned_devices/1.json
  def update
    respond_to do |format|
      if @owned_device.update(owned_device_params)
        format.html { redirect_to @owned_device, notice: 'Owned device was successfully updated.' }
        format.json { render :show, status: :ok, location: @owned_device }
      else
        format.html { render :edit }
        format.json { render json: @owned_device.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /owned_devices/1
  # DELETE /owned_devices/1.json
  def destroy
    @owned_device.destroy
    respond_to do |format|
      format.html { redirect_to owned_devices_url, notice: 'Owned device was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  #GET '/owned_devices/userid/:id
  #GET '/owned_devices/userid/:id.json
  #TODO: avoid using capitalize, access via user id instead. 
  def getByUser
    #@devices_owned_by_users = User.find(params[:id]).devices
    @user = User.find_by first_name: params[:name].capitalize
    @devices_owned_by_users = @user.devices
    render json: @devices_owned_by_users
  end

  def getUsersByChargerAndDistance
    #this block gets the user ids of people who have a given charger based on a charger id
    #First looks in Device, gets ids of all devices that use that charger
    #then looks in owned device for all owned_devices who have that each of those device ids
    #returns list of lists of user ids for each of those devices 
    #list of lists is then flattened, and eliminates duplicates
    #TODO add check to see if user is actually lending the device atm!!!!
    user_ids_with_charger = Device.where(charger_id: params[:charger_id]).map {|device| device.id}.map {|id| OwnedDevice.where(device_id: id).map{|owned_device| owned_device.user_id}}.flatten.uniq
    @users_with_charger = User.find(user_ids_with_charger)
    @users_with_charger = @users_with_charger - [current_user] #get rid of current user, can't borrow from yourself
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_owned_device
      @owned_device = OwnedDevice.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def owned_device_params
      params.require(:owned_device).permit(:id, :user_id, :device_id, :personal_device_name, :allow_lending)
    end
end
