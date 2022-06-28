import boto3
sc = boto3.client('servicecatalog')


def on_event(event, context):
	props = event["ResourceProperties"]
	print("create new resource with props %s" % props)
	message = event['ResourceProperties']['RERUN']

	

	ct_account_factory_sc_product = sc.describe_product_as_admin(
		Name='AWS Control Tower Account Factory'
	)
	ct_account_factory_sc_product_id = ct_account_factory_sc_product['ProductViewDetail']['ProductViewSummary']['ProductId']
	ct_account_factory_sc_provisioning_artifacts = sc.list_provisioning_artifacts(ProductId=ct_account_factory_sc_product_id)['ProvisioningArtifactDetails']
	active_provisioning_artifact_id = [provisioning_artifact for provisioning_artifact in ct_account_factory_sc_provisioning_artifacts if provisioning_artifact['Active']][0]['Id']


	attributes = {
		#'ProductId': ct_account_factory_sc_product_detail,	
		'ArtifactId': active_provisioning_artifact_id
	}
	return { 'Data': attributes }





